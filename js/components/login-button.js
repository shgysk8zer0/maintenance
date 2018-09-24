export default class LoginButton extends HTMLButtonElement {
	constructor() {
		super();
		this.hidden = true;
		this.addEventListener('click', async () => {
			await customElements.whenDefined('login-form');
			const detail = await document.querySelector('login-form').login();
			document.dispatchEvent(new CustomEvent('login', {detail}));
		});

		document.addEventListener('logout', async () => {
			await customElements.whenDefined('login-form');
			this.hidden = false;
		});

		document.addEventListener('login', () => this.hidden = true);

		customElements.whenDefined('login-form').then(() => {
			if (! sessionStorage.hasOwnProperty('token')) {
				this.hidden = false;
			}
		});
	}
}

customElements.define('login-button', LoginButton, {extends: 'button'});
