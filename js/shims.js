if (! HTMLLinkElement.prototype.hasOwnProperty('import')) {
	[...document.querySelectorAll('link[rel="import"]')].forEach(async link => {
		link.import = null;
		const url = new URL(link.href);
		const resp = await fetch(url);
		if (resp.ok) {
			const type = resp.headers.get('Content-Type').split(';').pop();
			const parser = new DOMParser();
			const content = await resp.text();
			link.import = parser.parseFromString(content, type);
			link.dispatchEvent(new Event('load'));
		} else {
			link.dispatchEvent(new Event('error'));
		}
	});
}
