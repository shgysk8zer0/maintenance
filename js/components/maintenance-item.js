import {ready, $} from '../std-js/functions.js';
import {confirm, alert} from '../std-js/asyncDialog.js';
import {IMAGES_DIR} from '../consts.js';
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
		});

		$('[data-action="edit"]', this.shadowRoot).click(() => alert('Not yet implemented'));
	}

	set uid(uid) {
		this.setAttribute('uid', uid);
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
		image.addEventListener('load', event => this.append(event.target));
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
			dateEl = document.createElement('time');
			dateEl.slot = 'due';
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
			descEl = document.createElement('span');
			descEl.slot = 'description';
			this.append(descEl);
		}
		descEl.textContent = desc;
	}

	get description() {
		return this.querySelector('[slot="description"]').textContent;
	}
}
