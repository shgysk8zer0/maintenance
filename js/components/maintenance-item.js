import {$, importLink} from '../std-js/functions.js';
import {confirm, alert} from '../std-js/asyncDialog.js';
import {createSlot} from '../functions.js';

export default class MaintenanceItem extends HTMLElement {
	constructor() {
		super();
		this.dataset.status = 'incomplete';
		this.classList.add('block', 'card');

		const template = document.getElementById('maintenance-item-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		this.shadowRoot.querySelector('meter').value = Date.parse(new Date());

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

	set due(date) {
		let dateEl = this.querySelector('[slot="due"]');

		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		if (! Number.isNaN(date.getTime())) {
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

importLink('MaintenanceItem').then(content => {
	document.body.append(...content.body.children);
	customElements.define('maintenance-item', MaintenanceItem);
}).catch(console.error);
