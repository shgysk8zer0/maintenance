import {IMAGES_DIR} from '../consts.js';
import {importLink} from '../std-js/functions.js';

export default class VehicleElement extends HTMLElement {
	constructor() {
		super();
		const template = document.getElementById('vehicle-element-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		document.addEventListener('logout', () => this.remove());
	}

	set name(name) {
		let nameEl = this.getSlotNode('name');

		if (! (nameEl instanceof HTMLElement)) {
			nameEl = document.createElement('span');
			nameEl.slot = 'name';
			this.append(nameEl);
		}
		nameEl.textContent = name;
	}

	get name() {
		const nameEl = this.getSlotNode('name');
		return nameEl instanceof HTMLElement ? nameEl.textContent : null;
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

	set image(img) {
		const image = new Image(128, 180);
		image.slot = 'thumbnail';
		image.src = new URL(img, IMAGES_DIR);

		if (this.hasSlotNode('thumbnail')) {
			this.getSlotNode('thumbnail').remove();
		}
		image.addEventListener('load', () => this.append(image));
	}

	set display(val) {
		this.shadowRoot.querySelector('.vehicle').setAttribute('display', val);
	}

	get display() {
		return this.shadowRoot.querySelector('.vehicle').getAttribute('display');
	}

	get maintenanceItems() {
		return [...this.querySelectorAll('[slot="maintenance-item"]')];
	}

	get slots() {
		return [...this.shadowRoot.querySelectorAll('slot')];
	}

	get slotNames() {
		return this.slots.map(slot => slot.name);
	}

	hasSlot(name) {
		return this.slotNames.includes(name);
	}

	getSlot(name) {
		return this.slots.find(slot => slot.name === name);
	}

	getSlotNodes(name) {
		const slot = this.getSlot(name);
		if (slot instanceof HTMLElement) {
			return slot.assignedNodes();
		} else {
			return [];
		}
	}

	getSlotNode(name, i = 0) {
		const nodes = this.getSlotNodes(name);
		return nodes.length > i ? nodes[i] : undefined;
	}

	hasSlotNode(name) {
		return this.getSlotNodes(name).length !== 0;
	}
}

importLink('VehicleElement').then(content => {
	document.body.append(...content.body.children);
	customElements.define('vehicle-element', VehicleElement);
}).catch(console.error);
