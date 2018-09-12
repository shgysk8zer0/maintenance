import MaintenanceItem from './maintenance-item.js';
customElements.define('maintenance-item', MaintenanceItem);

export default class MaintenanceTable extends HTMLElement {
	constructor(items = []) {
		super();
		this.addItem(...items);
	}

	async createItem(details = {}) {
		const item = new MaintenanceItem();
		await item.init();
		item.due = details.scheduled_dttm.replace(' ', 'T');
		item.description = details.description;
		try {
			item.previous = details.service_dttm.replace(' ', 'T');
		} catch(err) {
			item.previous = 0;
		}
		return item;
	}

	async addItem(...items) {
		const els = await Promise.all(items.map(item => this.createItem(item)));
		this.append(...els);
		return els;
	}

	getItems() {
		return Array.from(this.querySelectorAll('maintenance-item'));
	}
}
