import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready, registerServiceWorker, importLink, $} from './std-js/functions.js';
import {init} from './functions.js';
import './components/login-button.js';
import './components/logout-button.js';
import './components/vehicle-element.js';
import './components/maintenance-item.js';
import './components/login-form.js';
import './components/current-year.js';
import './components/copy-button.js';
import './components/vehicle-search.js';

registerServiceWorker('service-worker.js');

importLink('icons').then(icons => {
	const svg = icons.querySelector('svg');
	svg.setAttribute('hidden', '');
	document.body.append(document.importNode(svg, true));
}).catch(console.error);

ready('login-button', 'logout-button', 'vehicle-search').then(async () => {
	document.documentElement.classList.replace('no-js', 'js');
	window.addEventListener('offline', () => {
		document.documentElement.classList.add('offline');
		document.documentElement.classList.add('online');
		$('.online-only').hide();
		$('.offline-only').unhide();
	});

	window.addEventListener('online', () => {
		document.documentElement.classList.add('online');
		document.documentElement.classList.add('offline');
		$('.online-only').unhide();
		$('.offline-only').hide();
	});

	document.addEventListener('login', event => {
		Object.entries(event.detail).forEach(([key, value]) => {
			sessionStorage.setItem(key, value);
		});
		init().catch(console.error);
	});

	document.addEventListener('logout', () => sessionStorage.clear());

	$('[name="icons"]').import().then(icons => document.body.append(icons));

	if (sessionStorage.hasOwnProperty('token')) {
		init();
	}
});
