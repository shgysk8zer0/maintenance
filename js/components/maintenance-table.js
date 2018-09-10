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
		item.due = details.due;
		item.description = details.description;
		item.previous = details.previous;
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
