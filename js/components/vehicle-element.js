import {IMAGES_DIR} from '../consts.js';
import {$} from '../std-js/functions.js';

export default class VehicleElement extends HTMLElement {
	constructor() {
		super();
		this.hidden = true;
		this.classList.add('online-only');
		const icons = document.querySelector('link[rel="import"][name="icons"]').import.querySelector('svg');
		const template = document.getElementById('vehicle-element-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		this.shadowRoot.appendChild(icons.cloneNode(true));
		document.addEventListener('logout', () => this.remove());
		this.fadeIn();
	}

	async fadeOut({
		duration = 400,
		delay = 0,
		easing = 'ease-in-out',
	} = {}) {
		const anim = this.animate([{
			opacity: 1,
		}, {
			opacity: 0,
		}], {
			duration,
			easing,
			delay,
			fill: 'both',
		});
		await anim.finished;
		this.hidden = true;
	}

	async fadeIn({
		duration = 400,
		delay = 0,
		easing = 'ease-in-out',
	} = {}) {
		const anim = this.animate([{
			opacity: 0,
		}, {
			opacity: 1,
		}], {
			duration,
			easing,
			delay,
			fill: 'both',
		});
		this.hidden = false;
		await anim.finished;
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
		return parseInt(this.getAttribute('uid'));
	}

	set mileage(mileage) {
		this.setAttribute('mileage', mileage);
	}

	get mileage() {
		return  this.hasAttribute('mileage')
			? parseInt(this.getAttribute('mileage'))
			: NaN;
	}

	set image(img) {
		const image = new Image(256, 256);
		image.slot = 'thumbnail';
		image.src = new URL(img, IMAGES_DIR);
		image.alt = this.name;
		image.classList.add('cursor-pointer');

		if (this.hasSlotNode('thumbnail')) {
			this.getSlotNode('thumbnail').remove();
		}

		image.addEventListener('load', () => {
			this.append(image);
			image.addEventListener('click', () => {
				window.open(
					image.src,
					image.alt,
					`height=${image.naturalHeight},width=${image.naturalWidth},noopener`
				);
			});
		});
	}

	get image() {
		return this.getSlotNode('thumbnail');
	}

	set display(val) {
		this.shadowRoot.querySelector('.vehicle').setAttribute('display', val);
	}

	get display() {
		return this.shadowRoot.querySelector('.vehicle').getAttribute('display');
	}

	get maintenanceItems() {
		return this.getSlotNodes('maintenance-item');
	}

	get dueItems() {
		return this.maintenanceItems.filter(item => item.isDue);
	}

	get slots() {
		return [...this.shadowRoot.querySelectorAll('slot')];
	}

	get slotNames() {
		return this.slots.map(slot => slot.name);
	}

	matches(name) {
		return this.name.toLowerCase().includes(name.toLowerCase());
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

$('link[name="VehicleElement"]').import('template').then(content => {
	document.body.append(content);
	customElements.define('vehicle-element', VehicleElement);
}).catch(console.error);
