export default class LoginForm extends HTMLElement {
	constructor() {
		super();
		this.hidden = true;
		this.append(document.getElementById('login-template').content.cloneNode(true));

		if (this.hasAttribute('action')) {
			this.form.action = this.getAttribute('action');
		}

		if (this.hasAttribute('method')) {
			this.form.method = this.getAttribute('method');
		}

		this.form.addEventListener('reset', () => this.close());
	}

	get action() {
		return this.form.action;
	}

	set action(action) {
		this.form.action = action;
		this.setAttribute('action', action);
	}

	get method() {
		return this.form.method;
	}

	set method(method) {
		this.setAttribute('method', method);
		this.form.method = method;
	}

	async login() {
		return new Promise(async (resolve, reject) => {
			this.showModal();
			this.form.addEventListener('submit', async event => {
				event.preventDefault();
				try {
					const resp = await fetch(this.action);

					if (resp.ok) {
						const json = await resp.json();
						resolve(json);
						this.close();
						this.reset();
					} else {
						throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
					}
				} catch (error) {
					reject(error);
				}
			}, {
				once: true,
			});
			this.form.addEventListener('reset', () => {
				reject(new Error('Login cancelled'));
			}, {once: true});
		});
	}

	reset() {
		this.form.reset();
	}

	get dialog() {
		return this.querySelector('dialog');
	}

	get form() {
		return this.querySelector('form');
	}

	show() {
		this.hidden = false;
		this.dialog.show();
	}

	showModal() {
		this.hidden = false;
		this.dialog.showModal();
	}

	close() {
		this.hidden = true;
		this.dialog.close();
	}
}
