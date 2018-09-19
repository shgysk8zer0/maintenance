export default class CurrentYear extends HTMLTimeElement {
	constructor() {
		super();
		const now = new Date();
		this.textContent = now.getFullYear();
		this.dateTime = now.toISOString();
	}
}

customElements.define('current-year', CurrentYear, {extends: 'time'});
