export default class LoginButton extends HTMLButtonElement {
	constructor() {
		super();
		this.addEventListener('click', this.login);
		document.addEventListener('logout', () => this.hidden = false);
		document.addEventListener('login', () => this.hidden = true);
		this.hidden = sessionStorage.hasOwnProperty('token');
	}

	async login() {
		await customElements.whenDefined('login-form');
		const detail = await document.querySelector('login-form').login();
		document.dispatchEvent(new CustomEvent('login', {detail}));
	}
}

customElements.define('login-button', LoginButton, {extends: 'button'});
