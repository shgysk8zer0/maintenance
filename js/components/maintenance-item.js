import {ready} from '../std-js/functions.js';
let template = null;

export default class MaintenanceItem extends HTMLElement {
	constructor() {
		super();
		this.classList.add('block', 'card');
	}

	async init() {
		const template = await MaintenanceItem.getTemplate();
		template.querySelector('meter').value = Date.parse(new Date());
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(template);
		this.shadowRoot.querySelector('button').addEventListener('click', event => {
			event.target.disabled = true;
			this.previous = new Date();
		});
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
		prog.high = tstamp - 30 * 24 * 60 * 60;
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
