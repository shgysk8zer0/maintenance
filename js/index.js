import './std-js/deprefixer.js';
import './std-js/shims.js';
import {ready} from './std-js/functions.js';
import {init, initTemplates, defineElements} from './functions.js';
import {CUSTOM_ELEMENTS, TEMPLATES} from './consts.js';
import './components/login-button.js';
import './components/logout-button.js';
import './components/current-year.js';
import './components/copy-button.js';

initTemplates(...TEMPLATES).then(() => defineElements(...CUSTOM_ELEMENTS));

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
