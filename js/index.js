import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, notify, $} from './std-js/functions.js';
import LoginForm from './components/login-form.js';
import MaintenanceTable from './components/maintenance-table.js';
import {API, TEMPLATES, ELEMENTS} from './consts.js';

(async loads => {
	const parser = new DOMParser();
	const resps = await Promise.all(loads.map(load => fetch(load)));
	const strs = await Promise.all(resps.map(resp => resp.text()));
	const docs = strs.map(str => parser.parseFromString(str, 'text/html'));
	docs.forEach(doc => document.body.append(doc.querySelector('template')));

	customElements.define('login-form', LoginForm);
	customElements.define('maintenance-table', MaintenanceTable);
})(TEMPLATES);


ready().then(async () => {
	document.documentElement.classList.replace('no-js', 'js');
	await Promise.all(ELEMENTS.map(el => customElements.whenDefined(el)));

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

	$('[data-action="logout"]').click(LoginForm.logout);

	if (! sessionStorage.hasOwnProperty('token')) {
		await customElements.whenDefined('login-form');
		const data = await document.querySelector('login-form').login();
		Object.entries(data).forEach(([key, value]) => sessionStorage.setItem(key, value));
	}

	if (sessionStorage.getItem('maintenance_upcoming') === '1') {
		const notification = await notify('Maintenance is required soon', {
			body: 'Click here to see scheduled maintenance',
			icon: new URL('img/octicons/tools.svg', document.baseURI),
			tag: 'maintenance',
			dir: 'ltr',
			lang: 'en',
			data: {
				url: `${API}/allservices_log/`,
				token: sessionStorage.getItem('token'),
			}
		});

		notification.addEventListener('click', async event => {
			const resp = await fetch(new URL(`${event.target.data.url}${event.target.data.token}`), {
				mode: 'cors',
			});

			const json = await resp.json();
			console.log(json);
			document.getElementById('main').append(new MaintenanceTable(json));
		});
	}
}).catch(console.error);
