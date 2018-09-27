import './shims.js';
import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, registerServiceWorker} from './std-js/functions.js';
import {init, importLink} from './functions.js';
import './components/login-button.js';
import './components/logout-button.js';
// import './components/maintenance-table.js';
import './components/vehicle-element.js';
import './components/maintenance-item.js';
import './components/login-form.js';
import './components/current-year.js';
import './components/copy-button.js';

registerServiceWorker('service-worker.js');

importLink('icons').then(icons => {
	const svg = icons.querySelector('svg');
	svg.setAttribute('hidden', '');
	document.body.append(document.importNode(svg, true));
}).catch(console.error);

ready('login-button', 'logout-button').then(async () => {
	document.documentElement.classList.replace('no-js', 'js');

	document.addEventListener('login', event => {
		Object.entries(event.detail).forEach(([key, value]) => {
			sessionStorage.setItem(key, value);
		});
		init().catch(console.error);
	});

	document.addEventListener('logout', () => sessionStorage.clear());

	if (sessionStorage.hasOwnProperty('token')) {
		init();
	}
});
