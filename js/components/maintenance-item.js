import {$, importLink} from '../std-js/functions.js';
import {confirm, alert} from '../std-js/asyncDialog.js';
import {createSlot, validDate} from '../functions.js';

export default class MaintenanceItem extends HTMLElement {
	constructor() {
		super();
		this.dataset.status = 'incomplete';
		this.classList.add('block', 'card');

		const template = document.getElementById('maintenance-item-template');
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(document.importNode(template.content, true));
		this.dateMeter.value = Date.parse(new Date());

		$('[data-action="delete"]', this.shadowRoot).click(async () => {
			if (await confirm('Are you sure you want to delete this item?')) {
				this.remove();
			}
		});

		$('[data-action="done"]', this.shadowRoot).click(event => {
			event.target.closest('[data-action="done"]').disabled = true;
			this.dataset.status = 'completed';
			this.previous = new Date();
			// this.closest('maintenance-table').scheduled.append(this);
		});

		$('[data-action="edit"]', this.shadowRoot).click(() => alert('Not yet implemented'));
	}

	get isDue() {
		return new Date() > this.due;
	}

	set uid(uid) {
		this.setAttribute('uid', uid);
	}

	set mileage(mileage) {
		const meter = this.mileageMeter;
		let milesEl = this.findSlotNode('mileage');

		if (! (milesEl instanceof HTMLElement)) {
			milesEl = createSlot('mileage');
			this.append(milesEl);
		}
		milesEl.textContent = mileage;
		$('.current-miles', this.shadowRoot).text(mileage);
		meter.value = mileage;
		console.log({meter, milesEl, mileage});
	}

	get mileage() {
		const milesEl = this.findSlotNode('mileage');
		return milesEl instanceof HTMLElement ? parseInt(milesEl.textContent) : NaN;
	}

	get mileageDue() {
		const el = this.findSlotNode('mileage-due');
		return el instanceof HTMLElement ? parseInt(el.textContent) : NaN;
	}

	set mileageDue(miles) {
		if (! Number.isNaN(miles)) {
			const meter = this.mileageMeter;
			const previous = this.previousMileage;
			let milesEl = this.findSlotNode('mileage-due');

			if (! (milesEl instanceof HTMLElement)) {
				milesEl = createSlot('mileage-due');
				this.append(milesEl);
			}
			milesEl.textContent = miles;
			$('.mileage-due', this.shadowRoot).text(miles);
			meter.max = miles;
			if (! Number.isNaN(previous)) {
				meter.high = previous + 0.8 * (miles - previous);
			}
		}
	}

	set previousMileage(miles) {
		if (typeof miles === 'number' && ! Number.isNaN(miles)) {
			let el = this.findSlotNode('mileage-previous');
			const meter = this.mileageMeter;

			if (! (el instanceof HTMLElement)) {
				el = document.createElement('span');
				el.slot = 'mileage-previous';
				this.append(el);
			}

			$('.mileage-previous', this.shadowRoot).text(miles);
			el.textContent = miles;
			meter.low = miles;
		}
	}

	get previousMileage() {
		const el = this.findSlotNode('mileage-previous');
		return el instanceof HTMLElement ? parseInt(el.textContent) : NaN;
	}

	get uid() {
		return parseInt(this.getAttribute('uid'));
	}

	set priority(priority) {
		this.setAttribute('priority', priority);
	}

	get priority() {
		return this.hasAttribute('priority') ? parseInt(this.getAttribute('priority')): NaN;
	}

	set status(status) {
		this.setAttribute('status', status);
	}

	get status() {
		return this.getAttribute('status');
	}

	get due() {
		const dateEl = this.findSlotNode('due');

		if (dateEl instanceof HTMLTimeElement) {
			return new Date(dateEl.dateTime);
		} else if (dateEl instanceof HTMLElement) {
			return new Date(dateEl.innerHTML);
		} else {
			return undefined;
		}
	}

	set due(date) {
		let dateEl = this.findSlotNode('due');

		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		if (validDate(date)) {
			const tstamp = Date.parse(date);

			if (! (dateEl instanceof HTMLElement)) {
				dateEl = createSlot('due', {tag: 'time'});
				this.append(dateEl);
			}

			dateEl.textContent = date.toLocaleDateString();
			dateEl.dateTime = date.toISOString();
			const prog = this.dateMeter;
			prog.max = tstamp;
			prog.high = tstamp - 14 * 24 * 60 * 60;
		}
	}

	set previous(date) {
		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		if (! validDate(date)) {
			this.shadowRoot.querySelector('meter').min = Date.parse(date);
		}
	}

	set description(desc) {
		let descEl = this.findSlotNode('description');

		if (! (descEl instanceof HTMLElement)) {
			descEl = createSlot('description');
			this.append(descEl);
		}
		descEl.textContent = desc;
	}

	get description() {
		return this.findSlotNodes('description').textContent;
	}

	get mileageMeter() {
		return this.shadowRoot.querySelector('.miles-meter');
	}

	get dateMeter() {
		return this.shadowRoot.querySelector('.due-meter');
	}

	get slots() {
		return Array.from(this.shadowRoot.querySelectorAll('slot'));
	}

	findSlot(name) {
		return this.slots.find(slot => slot.name === name);
	}

	findSlotNodes(name) {
		const slot = this.findSlot(name);
		if (slot instanceof HTMLElement) {
			return slot.assignedNodes();
		} else {
			return [];
		}
	}

	findSlotNode(name, i = 0) {
		return this.findSlotNodes(name)[i];
	}
}

importLink('MaintenanceItem').then(content => {
	document.body.append(...content.body.children);
	customElements.define('maintenance-item', MaintenanceItem);
}).catch(console.error);
