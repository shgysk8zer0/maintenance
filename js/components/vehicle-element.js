import {IMAGES_DIR} from '../consts.js';
import MaintenanceItem from './maintenance-item.js';

export default class VehicleElement extends HTMLElement {
	constructor() {
		super();
		const template = document.getElementById('vehicle-element-template').content;
		const items = document.createElement('div');
		items.slot = 'maintenance-items';
		this.append(items);
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(template.cloneNode(true));
	}

	set name(name) {
		let nameEl = this.querySelector('[slot="name"]');

		if (! (nameEl instanceof HTMLElement)) {
			nameEl = document.createElement('span');
			nameEl.textContent = name;
			this.append(nameEl);
		} else {
			nameEl.textContent = name;
		}
	}

	set uid(uid) {
		this.setAttribute('uid', uid);
	}

	get uid() {
		return this.getAttribute('uid');
	}

	set mileage(mileage) {
		this.setAttribute('mileage', mileage);
	}

	get mileage() {
		return this.getAttribute('mileage');
	}

	get name() {
		const nameEl = this.querySelector('[slot="name"]');
		return nameEl instanceof HTMLElement ? nameEl.textContent : null;
	}

	addItem(...items) {
		items.forEach(item => {
			if (item instanceof MaintenanceItem) {
				this.querySelector('[slot="maintenance-items"]').append(item);
			} else {
				throw new Error('Attempting to add a non-MaintenanceItem to a vehicle');
			}
		});
	}

	set image(img) {
		const image = new Image();
		image.slot = 'thumbnail';
		image.src = new URL(img, IMAGES_DIR);
		image.addEventListener('load', () => this.append(image));
	}
}
