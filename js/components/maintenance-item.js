import {ready, $} from '../std-js/functions.js';
import {confirm, alert} from '../std-js/asyncDialog.js';
import {IMAGES_DIR} from '../consts.js';
import {createSlot} from '../functions.js';
const TEMPLATE = new URL('/templates/maintenance-item.html', document.baseURI);
const TAG = 'maintenance-item';
let template = null;

export default class MaintenanceItem extends HTMLElement {
	constructor() {
		super();
		this.dataset.status = 'incomplete';
		this.classList.add('block', 'card');
	}

	async init() {
		const template = await MaintenanceItem.getTemplate();
		template.querySelector('meter').value = Date.parse(new Date());
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(template);

		$('[data-action="delete"]', this.shadowRoot).click(async () => {
			if (await confirm('Are you sure you want to delete this item?')) {
				this.remove();
			}
		});

		$('[data-action="done"]', this.shadowRoot).click(event => {
			event.target.closest('[data-action="done"]').disabled = true;
			this.dataset.status = 'completed';
			this.previous = new Date();
			this.closest('maintenance-table').scheduled.append(this);
		});

		$('[data-action="edit"]', this.shadowRoot).click(() => alert('Not yet implemented'));
	}

	set uid(uid) {
		this.setAttribute('uid', uid);
	}

	set mileage(mileage) {
		const meter = this.shadowRoot.querySelector('.miles-meter');
		let milesEl = this.querySelector('[slot="mileage"]');

		if (! (milesEl instanceof HTMLElement)) {
			milesEl = createSlot('mileage');
			this.append(milesEl);
		}
		milesEl.textContent = mileage;
		this.shadowRoot.querySelector('.current-miles').textContent = mileage;
		meter.value = mileage;
	}

	get mileage() {
		const milesEl = this.querySelector('[slot="mileage"]');
		return milesEl instanceof HTMLElement ? parseInt(milesEl.textContent) : NaN;
	}

	get uid() {
		return this.getAttribute('uid');
	}

	set vehicleUid(uid) {
		this.setAttribute('vehicle-uid', uid);
	}

	get vehicleUid() {
		return this.getAttribute('vehicle-uid');
	}

	set serviceUid(uid) {
		this.setAttribute('service-uid', uid);
	}

	get serviceUid() {
		return this.getAttribute('service-uid');
	}

	set vehicle(vehicle) {
		this.setAttribute('vehicle', vehicle);
	}

	get vehicle() {
		return this.getAttribute('vehicle');
	}

	set priority(priority) {
		this.setAttribute('priority', priority);
	}

	get priority() {
		return parseInt(this.getAttribute('priority'));
	}

	set status(status) {
		this.setAttribute('status', status);
	}

	get status() {
		return this.getAttribute('status');
	}

	set image(img) {
		const image = new Image();
		image.src = new URL(img, IMAGES_DIR);
		image.height = 96;
		image.width = 96;
		image.decoding = 'async';
		image.slot = 'image';
		image.classList.add('vehicle-image');
		image.alt = this.vehicle;
		image.addEventListener('click', event => {
			window.open(
				event.target.src,
				event.target.alt,
				`height=${event.target.naturalHeight},width=${event.target.naturalWidth}`
			);
		});
		image.addEventListener('load', event => {
			const currentImg = this.querySelector('[slot="image"]');
			currentImg instanceof HTMLElement
				? currentImg.replaceWith(event.target)
				: this.append(event.target);
		});
		image.addEventListener('error', event => console.error(event));
	}

	get image() {
		return this.querySelector('[slot="image"]');
	}

	static async getTemplate() {
		if (! (template instanceof HTMLElement)) {
			await ready();
			template = document.getElementById('maintenance-item-template').content;
		}
		return template.cloneNode(true);
	}

	set due(date) {
		let dateEl = this.querySelector('[slot="due"]');

		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		const tstamp = Date.parse(date);

		if (! (dateEl instanceof HTMLElement)) {
			dateEl = createSlot('due', {tag: 'time'});
			this.append(dateEl);
		}

		dateEl.textContent = date.toLocaleDateString();
		dateEl.dateTime = date.toISOString();
		const prog = this.shadowRoot.querySelector('meter');
		prog.max = tstamp;
		prog.high = tstamp - 14 * 24 * 60 * 60;
	}

	set previous(date) {
		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		this.shadowRoot.querySelector('meter').min = Date.parse(date);
	}

	get due() {
		const dateEl = this.querySelector('[slot="due"]');
		if (dateEl instanceof HTMLTimeElement) {
			return new Date(dateEl.dateTime);
		} else if (dateEl instanceof HTMLElement) {
			return new Date(dateEl.innerHTML);
		} else {
			throw new Error('No due date set');
		}
	}

	set description(desc) {
		let descEl = this.querySelector('[slot="description"]');
		if (! (descEl instanceof HTMLElement)) {
			descEl = createSlot('description');
			this.append(descEl);
		}
		descEl.textContent = desc;
	}

	get description() {
		return this.querySelector('[slot="description"]').textContent;
	}
}

fetch(TEMPLATE).then(async resp => {
	const parser = new DOMParser();
	const html = await resp.text();
	const doc = parser.parseFromString(html, 'text/html');
	document.body.append(...doc.querySelectorAll('template'));
	customElements.define(TAG, MaintenanceItem);
});
