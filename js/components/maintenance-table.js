import MaintenanceItem from './maintenance-item.js';
customElements.define('maintenance-item', MaintenanceItem);

export default class MaintenanceTable extends HTMLElement {
	constructor(items = []) {
		super();
		this.attachShadow({mode: 'open'});
		const template = document.getElementById('maintenance-table-template').content;
		const container = document.createElement('div');
		container.slot = 'items';
		this.append(container);
		this.shadowRoot.append(template);
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
		this.scheduled.append(...els);
		return els;
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
}
