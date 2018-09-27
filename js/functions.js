import {notify} from './std-js/functions.js';
import {API, IMAGES_DIR} from './consts.js';
import {confirm} from './std-js/asyncDialog.js';
import VehicleElement from './components/vehicle-element.js';
import MaintenanceItem from './components/maintenance-item.js';

export async function importLink(name) {
	return new Promise(async (resolve, reject) => {
		const link = document.querySelector(`link[rel="import"][name="${name}"]`);
		if (link instanceof HTMLLinkElement) {
			if (link.import === null) {
				link.addEventListener('load', event => resolve(event.target.import), {once: true});
				link.addEventListener('error', event => reject(event), {once: true});
			} else {
				resolve(link.import);
			}
		} else {
			reject(new Error(`Link named "${name}" not found`));
		}
	});
}

export function createSlot(name, {
	tag = 'span',
	text = '',
	attrs = {},
} ={}) {
	const el = document.createElement(tag);
	el.slot = name;
	el.textContent = text;
	Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
	return el;
}

async function fillMaintenanceTable(url) {
	// const maintenance = document.querySelector('maintenance-table');
	const resp = await fetch(url, {
		mode: 'cors',
	});

	const json = await resp.json();
	if (json.hasOwnProperty('error') && json.hasOwnProperty('message')) {
		throw new Error(`${json.message} [${json.error}]`);
	} else if (Array.isArray(json)) {
		const vehicles = json.reduce((vehicles, item) => {
			let vehicle = vehicles.find(vehicle => vehicle.name === item.vehicle);
			if (typeof vehicle === 'undefined') {
				vehicle = {
					name: item.vehicle,
					image: item.vehicle_image === '' ? null : new URL(item.vehicle_image, IMAGES_DIR),
					mileage: parseInt(item.current_mileage),
					uid: parseInt(item.vehicles_uid),
					maintenance: [],
				};
				vehicles.push(vehicle);
			}
			vehicle.maintenance.push({
				uid: parseInt(item.services_uid),
				description: item.description,
				scheduled: {
					miles: parseInt(item.mileage_when_serviced) + parseInt(item.frequencymiles),
					date: new Date(item.service_dttm.replace(' ', 'T')),
					locationName: item.name,
				},
				lastService: {
					miles: parseInt(item.mileage_when_serviced),
					date: new Date(item.service_dttm.replace(' ', 'T')),
				},
				reminder: {
					miles: parseInt(item.remind_x_miles),
					date: new Date(item.reminder_dttm.replace(' ', 'T')),
				},
				frequencyMiles: parseInt(item.frequencymiles),
				status: item.log_status,
				priority: parseInt(item.priority),
			});
			return vehicles;
		}, []);
		console.log(vehicles);
		console.info(json);
		// await customElements.whenDefined('maintenance-table');
		await customElements.whenDefined('vehicle-element');
		const els = vehicles.map(vehicle => {
			const el = new VehicleElement();
			const items = vehicle.maintenance.map(item => {
				const el = new MaintenanceItem();
				el.slot = 'maintenance-item';
				el.description = item.description;
				el.uid = item.uid;
				el.status = item.status;
				el.priority = item.priority;
				el.mileage = vehicle.mileage;
				try {
					el.due = item.scheduled.date || new Date();
					el.previous = item.lastService.date || new Date();
				} catch (err) {
					console.error(err);
				}
				return el;
			});
			el.classList.add('card', 'shadow', 'block');
			el.name = vehicle.name;
			el.uid = vehicle.uid;
			el.mileage = vehicle.mileage;
			el.image = vehicle.image;
			el.append(...items);
			return el;
		});
		document.querySelector('main').append(...els);
		// maintenance.addItem(...json);
		// maintenance.hidden = false;
	}
}

export async function init() {
	if (sessionStorage.getItem('maintenance_upcoming') === '1') {
		const data = {
			url: `${API}/allservices_log/`,
			token: sessionStorage.getItem('token'),
		};
		try {
			const notification = await notify('Maintenance is required soon', {
				body: 'Click here to see scheduled maintenance',
				icon: new URL('img/octicons/tools.svg', document.baseURI),
				tag: 'maintenance',
				dir: 'ltr',
				lang: 'en',
				data,
			});

			notification.addEventListener('click', async event => {
				try {
					await fillMaintenanceTable(new URL(`${event.target.data.url}${event.target.data.token}`));
				} catch(err) {
					console.error(err);
				}
			});
		} catch (err) {
			console.error(err);
			if (await confirm('You have upcoming maintenance. View it now?')) {
				fillMaintenanceTable(new URL(`${data.url}${data.token}`));
			}
		}
	}
}

export async function getIcon(path, {
	fill = '#363636',
	height = null,
	width = null,
} = {}) {
	const iconResp = await fetch(new URL(path, document.baseURI));
	const parser = new DOMParser();
	const body = await iconResp.text();
	const icon = parser.parseFromString(body, 'image/svg+xml');
	if (! Number.isNaN(width)) {
		icon.documentElement.setAttribute('width', width);
	}
	if (! Number.isNaN(height)) {
		icon.documentElement.setAttribute('height', height);
	}
	icon.documentElement.firstElementChild.setAttribute('fill', fill);
	return `data:image/svg+xml;base64,${btoa(icon.documentElement.outerHTML)}`;
}

export async function whenDefined(...els) {
	return Promise.all(els.map(el => customElements.whenDefined(el)));
}
