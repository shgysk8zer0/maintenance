import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, notify, $} from './std-js/functions.js';
import LoginForm from './components/login-form.js';
import MaintenanceTable from './components/maintenance-table.js';
import {API} from './consts.js';

customElements.define('login-form', LoginForm);
customElements.define('maintenance-table', MaintenanceTable);

async function getIcon(path, {
	fill = '#363636',
	height = null,
	width = null,
} = {}) {
	const iconResp = await fetch(new URL(path, document.baseURI));
	const parser = new DOMParser();
	const body = await iconResp.text();
	const icon = parser.parseFromString(body, 'image/svg+xml');
	if (! Number.isNaN(width)) {
		icon.documentElement.setAttribute('width', width);
	}
	if (! Number.isNaN(height)) {
		icon.documentElement.setAttribute('height', height);
	}
	icon.documentElement.firstElementChild.setAttribute('fill', fill);
	return `data:image/svg+xml;base64,${btoa(icon.documentElement.outerHTML)}`;
}

async function init() {
	if (sessionStorage.getItem('maintenance_upcoming') === '1') {
		const notification = await notify('Maintenance is required soon', {
			body: 'Click here to see scheduled maintenance',
			icon: await getIcon('img/octicons/tools.svg', {
				width: 64,
				height: 64,
			}),
			tag: 'maintenance',
			dir: 'ltr',
			lang: 'en',
			data: {
				url: `${API}/allservices_log/`,
				token: sessionStorage.getItem('token'),
			}
		});

		notification.addEventListener('click', async event => {
			try {
				const maintenance = document.querySelector('maintenance-table');
				const resp = await fetch(new URL(`${event.target.data.url}${event.target.data.token}`), {
					mode: 'cors',
				});

				const json = await resp.json();
				if (json.hasOwnProperty('error') && json.hasOwnProperty('message')) {
					throw new Error(`${json.message} [${json.error}]`);
				}
				console.log(json);
				maintenance.addItem(...json);
				maintenance.hidden = false;
			} catch(err) {
				console.error(err);
			}
		});
	}
}

async function showLogin() {
	await customElements.whenDefined('login-form');
	const data = await document.querySelector('login-form').login();
	Object.entries(data).forEach(([key, value]) => sessionStorage.setItem(key, value));
	await init();
}

ready().then(async () => {
	document.documentElement.classList.replace('no-js', 'js');
	const maintenance = document.querySelector('maintenance-table');
	if (typeof navigator.clipboard === 'object' && navigator.clipboard.writeText instanceof Function) {
		document.querySelectorAll('[data-copy]').forEach(btn => {
			btn.hidden = false;
			btn.addEventListener('click', event => {
				try {
					const target = event.target.closest('[data-copy]');
					navigator.clipboard.writeText(target.dataset.copy);
				} catch (err) {
					console.error(err);
				}
			});
		});
	} else {
		document.querySelectorAll('[data-copy]').forEach(btn => btn.hidden = true);
	}

	document.addEventListener('login', event => {
		Object.entries(event.detail).forEach(([key, value]) => sessionStorage.setItem(key, value));
		init();
	});

	document.addEventListener('logout', () => {
		maintenance.hidden = true;
		maintenance.clear();
	});
	$('[data-action="logout"]').click(LoginForm.logout);
	$('[data-action="login"]').click(showLogin);

	if (! sessionStorage.hasOwnProperty('token')) {
		showLogin();
		$('[data-action="login"]').unhide();
		$('[data-action="logout"]').hide();
	} else {
		$('[data-action="login"]').hide();
		$('[data-action="logout"]').unhide();
		init();
	}
}).catch(console.error);
