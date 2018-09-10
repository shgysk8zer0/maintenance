export default class LoginForm extends HTMLElement {
	constructor() {
		super();
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
			this.show();
			this.form.addEventListener('submit', async event => {
				event.preventDefault();
				try {
					/*const headers = new Headers();
					const body = new FormData(this.form);
					headers.set('Accept', 'application/json');
					const resp = await fetch(this.action, {
						method: this.method,
						body,
						headers,
						mode: 'cors',
					});*/
					const resp = await fetch(this.action);

					if (resp.ok) {
						const json = await resp.json();
						resolve(json);
						this.dialog.close();
						this.form.reset();
					} else {
						throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
					}
				} catch (error) {
					reject(error);
				}
			}, {
				once: true,
			});
			this.form.addEventListener('reset', () => reject(new Error('Login cancelled')), {once: true});
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
		this.dialog.showModal();
	}

	close() {
		this.dialog.close();
	}
}
