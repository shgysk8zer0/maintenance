import {$} from '../std-js/functions.js';
import {API} from '../consts.js';

export default class LoginForm extends HTMLElement {
	constructor() {
		super();
		this.hidden = true;
		this.append(document.getElementById('login-template').content.cloneNode(true));

		if (this.hasAttribute('action')) {
			this.form.action = this.getAttribute('action');
		} else {
			this.setAttribute('action', `${API}/logins/`);
			this.form.action = `${API}/logins/`;
		}

		if (this.hasAttribute('method')) {
			this.form.method = this.getAttribute('method');
		}

		this.form.addEventListener('reset', () => this.close());
	}

	set userid(userid) {
		this.querySelector('[name="userid"]').value = userid;
	}

	set password(password) {
		this.querySelector('[name="password"]').value = password;
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
					const headers = new Headers();
					const form = new FormData(event.target);
					headers.set('Content-Type', 'application/json;charset=utf-8');
					headers.set('Accept', 'Basic');
					const resp = await fetch(this.action, {
						method: this.method,
						headers,
						body: JSON.stringify([{
							userid: form.get('userid'),
							password: form.get('password'),
						}]),
						mode: 'cors',
					});

					if (resp.ok) {
						const json = await resp.json();
						if (json.hasOwnProperty('error') && json.hasOwnProperty('message')) {
							reject(new Error(`${json.message} [${json.error}]`));
						}
						resolve(json);
						$('[data-action="login"]').hide();
						$('[data-action="logout"]').unhide();
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

	static logout() {
		sessionStorage.clear();
		$('[data-action="login"]').unhide();
		$('[data-action="logout"]').hide();
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
