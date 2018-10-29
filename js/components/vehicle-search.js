import {$} from '../std-js/functions.js';

export default class VehicleSearch extends HTMLFormElement {
	constructor() {
		super();
		this.hidden = true;
		customElements.whenDefined('login-form').then(() => {
			this.hidden = ! customElements.get('login-form').loggedIn;
		});
		const icons = document.querySelector('link[rel="import"][name="icons"]').import.querySelector('svg').cloneNode(true);
		const template = document.getElementById('vehicle-search-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		this.shadowRoot.appendChild(icons.cloneNode(true));

		document.addEventListener('login', () => this.hidden = false);
		document.addEventListener('logout', () => this.hidden = true);

		this.addEventListener('submit', event => event.preventDefault());
		this.resetButton.addEventListener('click', () => this.clear(), {pasive: true});
		this.input.addEventListener('input', event => this.search(event.target.value), {
			passive: true,
		});
	}

	clear() {
		this.input.value = '';
		this.misses.forEach(vehicle => vehicle.fadeIn());
	}

	search(name) {
		if (name === '') {
			this.misses.forEach(vehicle => {
				vehicle.fadeIn();
			});
		} else {
			this.vehicleElements.forEach(vehicle => {
				if (vehicle.matches(name)) {
					if (vehicle.hidden) {
						vehicle.fadeIn();
					}
				} else if (! vehicle.hidden) {
					vehicle.fadeOut();
				}
			});
		}
	}

	get matches() {
		return this.vehicleElements.filter(vehicle => ! vehicle.hidden);
	}

	get misses() {
		return this.vehicleElements.filter(vehicle => vehicle.hidden);
	}

	get vehicleElements() {
		return Array.from(document.querySelectorAll('vehicle-element'));
	}

	get input() {
		return this.shadowRoot.querySelector('input[type="search"]');
	}

	get resetButton() {
		return this.shadowRoot.querySelector('[type="reset"]');
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

$('link[name="VehicleSearch"]').import('template').then(content => {
	document.body.append(content);
	customElements.define('vehicle-search', VehicleSearch, {extends: 'form'});
}).catch(console.error);
