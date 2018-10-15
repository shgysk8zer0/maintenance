import {importLink} from '../std-js/functions.js';

export default class VehicleSearch extends HTMLFormElement {
	constructor() {
		super();
		this.hidden = true;
		const icons = document.querySelector('link[rel="import"][name="icons"]').import.querySelector('svg').cloneNode(true);
		const template = document.getElementById('vehicle-search-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		this.shadowRoot.appendChild(icons.cloneNode(true));

		document.addEventListener('login', () => this.hidden = false);
		document.addEventListener('logout', () => this.hidden = true);
		this.addEventListener('submit', event => event.preventDefault());
		this.input.addEventListener('input', event => {
			const vehicles = Array.from(document.querySelectorAll('vehicle-element'));
			if (event.target.value === '') {
				vehicles.forEach(vehicle => vehicle.hidden = false);
			} else {
				vehicles.forEach(vehicle => {
					vehicle.hidden = !vehicle.name.toLowerCase().includes(event.target.value.toLowerCase());
				});
			}
		}, {
			passive: true,
		});
	}

	get input() {
		return this.shadowRoot.querySelector('input[type="search"]');
	}

	get vehicles() {
		return [...this.input.list.options].map(opt => opt.value);
	}

	set vehicles(vehicles) {
		if (Array.isArray(vehicles)) {
			const opts = vehicles.map(vehicle => {
				const opt = document.createElement('option');
				opt.value = vehicle.name;
				return opt;
			});
			[...this.input.list.options].forEach(opt => opt.remove());
			this.input.list.append(...opts);
		}
	}
}

importLink('VehicleSearch').then(content => {
	document.body.append(...content.body.children);
	customElements.define('vehicle-search', VehicleSearch, {extends: 'form'});
}).catch(console.error);
