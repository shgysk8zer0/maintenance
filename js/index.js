import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready} from './std-js/functions.js';
import {init, initTemplates} from './functions.js';
import LoginForm from './components/login-form.js';
import MaintenanceTable from './components/maintenance-table.js';
import './components/login-button.js';
import './components/logout-button.js';
import './components/current-year.js';
import './components/copy-button.js';

initTemplates().then(() => {
	customElements.define('login-form', LoginForm);
	customElements.define('maintenance-table', MaintenanceTable);
});

ready().then(async () => {
	document.documentElement.classList.replace('no-js', 'js');

	document.addEventListener('login', event => {
		init();
		Object.entries(event.detail).forEach(([key, value]) => {
			sessionStorage.setItem(key, value);
		});
	});

	document.addEventListener('logout', () => sessionStorage.clear());

	if (sessionStorage.hasOwnProperty('token')) {
		init();
	}
});
