import MaintenanceTable from './components/maintenance-table.js';
import LoginForm from './components/login-form.js';

export const API = 'https://www.vrmtel.net/api/v1/slapi.php';
export const TEMPLATES = [
	new URL('templates/login-form.html', document.baseURI),
	new URL('templates/maintenance-table.html', document.baseURI),
	new URL('templates/maintenance-item.html', document.baseURI),
];
export const ELEMENTS = [
	'login-form',
	'maintenance-item',
	'maintenance-table',
];
export const CUSTOM_ELEMENTS = [
	{
		tag: 'login-form',
		proto: LoginForm,
	}, {
		tag: 'maintenance-table',
		proto: MaintenanceTable,
	},
];
export const IMAGES_DIR = 'http://sentineldrive.com/Uploader/images/';
