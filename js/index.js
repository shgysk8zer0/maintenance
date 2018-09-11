import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, notify} from './std-js/functions.js';
import LoginForm from './components/login-form.js';
import MaintenanceTable from './components/maintenance-table.js';

customElements.define('login-form', LoginForm);
customElements.define('maintenance-table', MaintenanceTable);

ready().then(async () => {
	document.documentElement.classList.replace('no-js', 'js');
	await customElements.whenDefined('login-form');
	const data = await document.querySelector('login-form').login();
	const resp = await fetch(data.maintenance);
	const json = await resp.json();

	if (Array.isArray(json) && json.length !== 0) {
		try {
			const notification = await notify('Maintenance pending', {
				body: 'Click here for more details',
				icon: new URL('img/adwaita-icons/categories/preferences-system.svg', document.baseURI),
				lang: 'en',
				dir: 'ltr',
				tag: 'info',
				requireInteraction: true,
				data: {
					items: json,
				},
			});

			notification.addEventListener('click', event => {
				const table = new MaintenanceTable(event.target.data.items);
				table.classList.add('block');
				document.getElementById('main').append(table);
			});
		} catch (error) {
			console.error(error);
		}
	}
}).catch(console.error);
