export default class LogoutButton extends HTMLButtonElement {
	constructor() {
		super();
		this.addEventListener('click', () => document.dispatchEvent(new CustomEvent('logout')));
		document.addEventListener('logout', () => this.hidden = true);
		document.addEventListener('login', () => this.hidden = false);
		this.hidden = ! sessionStorage.hasOwnProperty('token');
	}
}

customElements.define('logout-button', LogoutButton, {extends: 'button'});
