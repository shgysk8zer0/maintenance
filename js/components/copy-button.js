export default class CopyButton extends HTMLButtonElement {
	constructor() {
		super();
		if (typeof navigator.clipboard === 'object' && navigator.clipboard.writeText instanceof Function) {
			this.addEventListener('click', () => {
				const target = this.target;
				if (target instanceof Element) {
					navigator.clipboard.writeText(('value' in target) ? target.value : target.textContent);
				} else {
					throw new Error('No target to copy from');
				}
			});
			this.hidden = false;
		} else {
			this.hidden = true;
		}
	}

	get target() {
		return this.ownerDocument.querySelector(this.getAttribute('target'));
	}

	set target(selector) {
		this.setAttribute('target', selector);
	}
}


customElements.define('copy-button', CopyButton, {extends: 'button'});
