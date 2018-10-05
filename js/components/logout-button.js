export default class LogoutButton extends HTMLButtonElement {
	constructor() {
		super();
		customElements.whenDefined('login-form').then(() => {
			const LoginForm = customElements.get('login-form');
			this.hidden = ! LoginForm.loggedIn;
			this.addEventListener('click', LoginForm.logOut);
		});
		document.addEventListener('logout', () => this.hidden = true);
		document.addEventListener('login', () => this.hidden = false);
	}
}

customElements.define('logout-button', LogoutButton, {extends: 'button'});
