export default class LoginButton extends HTMLButtonElement {
	constructor() {
		super();
		this.hidden = true;

		document.addEventListener('logout', () => this.hidden = false);
		document.addEventListener('login', () => this.hidden = true);

		customElements.whenDefined('login-form').then(() => {
			const LoginForm = customElements.get('login-form');
			console.log(LoginForm);
			this.hidden = LoginForm.loggedIn;
			this.addEventListener('click', () => {
				document.querySelector('login-form').login();
			});
		});
	}
}

customElements.define('login-button', LoginButton, {extends: 'button'});
