import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, registerServiceWorker} from './std-js/functions.js';
import {init} from './functions.js';
import './components/login-button.js';
import './components/logout-button.js';
import './components/maintenance-table.js';
import './components/maintenance-item.js';
import './components/login-form.js';
import './components/current-year.js';
import './components/copy-button.js';
import './components/svg-icons.js';

registerServiceWorker('service-worker.js');

ready('login-form', 'login-button', 'logout-button').then(async () => {
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
