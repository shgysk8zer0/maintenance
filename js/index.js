import {$, ready} from './std-js/functions.js';

ready().then(async () => {
	const $doc = $(document.documentElement);
	$doc.replaceClass('no-js', 'js');
});
