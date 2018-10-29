import MaintenanceItem from './maintenance-item.js';
import {$} from '../std-js/functions.js';

export default class MaintenanceTable extends HTMLElement {
	constructor(items = []) {
		super();

		document.addEventListener('logout', () => {
			this.hidden = true;
			this.clear();
		});

		const icons = document.querySelector('link[rel="import"][name="icons"]').import.querySelector('svg');

		this.attachShadow({mode: 'open'});
		const template = document.getElementById('maintenance-table-template').content;
		const container = document.createElement('div');
		this.append(container);
		this.shadowRoot.appendChild(document.importNode(template, true));
		this.shadowRoot.appendChild(icons.cloneNode(true));
		if (Array.isArray(items)) {
			this.addItem(...items);
		}
	}

	async createItem(details = {}) {
		const item = new MaintenanceItem();
		await item.init();
		item.due = details.scheduled_dttm.replace(' ', 'T');
		item.description = details.description;
		item.vehicle = details.vehicle;
		item.uid = details.uid;
		item.priority = details.priority;
		item.status = details.log_status;
		item.vehicleUid = details.vehicles_uid;
		item.mileage = details.current_mileage;
		if (details.vehicle_image !== '') {
			item.image = details.vehicle_image;
		}
		try {
			item.previous = details.service_dttm.replace(' ', 'T');
		} catch(err) {
			item.previous = 0;
		}
		return item;
	}

	async addItem(...items) {
		const els = await Promise.all(items.map(item => this.createItem(item)));
		els.forEach(el => {
			switch(el.status) {
			case 'Upcoming Service Scheduled':
				this.scheduled.append(el);
				break;
			case 'Reminder Date Reached':
				this.pending.append(el);
				break;
			default: this.unscheduled.append(el);
			}
		});
		return els;
	}

	clear() {
		this.scheduledItems.forEach(el => el.remove());
		this.pendingItems.forEach(el => el.remove());
		this.unscheduledItems.forEach(el => el.remove());
	}

	get pending() {
		return this.querySelector('[slot="pending"]');
	}

	get pendingItems() {
		return [...this.pending.children];
	}

	get scheduled() {
		return this.querySelector('[slot="scheduled"]');
	}

	get scheduledItems() {
		return [...this.scheduled.children];
	}

	get unscheduled() {
		return this.querySelector('[slot="unscheduled"]');
	}

	get unscheduledItems() {
		return [...this.unscheduled.children];
	}

	get items() {
		return {
			pending: this.pendingItems,
			scheduled: this.scheduledItems,
			unscheduled: this.unscheduledItems,
		};
	}

	get vehicles() {
		return [...this.querySelector('vehicle-element')];
	}
}

$('link[name="MaintenanceTable"]').import('template').then(content => {
	document.body.append(content);
	customElements.define('maintenance-Table', MaintenanceTable);
}).catch(console.error);
