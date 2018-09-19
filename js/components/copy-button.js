export default class CopyButton extends HTMLButtonElement {
	constructor() {
		super();
		if (typeof navigator.clipboard === 'object' && navigator.clipboard.writeText instanceof Function) {
			this.addEventListener('click', () => navigator.clipboard.writeText(this.dataset.copy));
			this.hidden = false;
		} else {
			this.hidden = true;
		}
	}
}

customElements.define('copy-button', CopyButton, {extends: 'button'});
