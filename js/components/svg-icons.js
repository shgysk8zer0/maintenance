export default class SVGIcons extends HTMLElement {
	constructor() {
		super();
		this.hidden = true;
		this.addEventListener('stateChange', event => {
			switch(event.detail.newValue) {
			case 'complete':
				this.dispatchEvent(new Event('load'));
				break;
			case 'importing':
				this.dispatchEvent(new CustomEvent('loadStart'));
				break;
			}
		});

		this.addEventListener('sourceChange', () => {
			this.state = 'pending';
			[...this.children].forEach(child => child.remove());
			this.import();
		});

		this.addEventListener('error', err => {
			console.error(err.error);
			this.state = 'failed';
		});

		this.addEventListener('load', () => {
			this.state = 'complete';
		});

		if (this.hasAttribute('src')) {
			this.import();
		}
	}

	get src() {
		return this.hasAttributes('src')
			? new URL(this.getAttribute('src'), this.ownerDocument.baseURI)
			: undefined;
	}

	set src(src) {
		const detail = {
			newValue: src,
			oldValue: this.src,
		};
		if (src !== this.src) {
			this.setAttribute('src', src);
			this.dispatchEvent(new CustomEvent('sourceChange', {detail}));
		}
	}

	get state() {
		return this.getAttribute('state') || 'pending';
	}

	get pending() {
		return this.state === 'pending';
	}

	get failed() {
		return this.state === 'failed';
	}

	set state(newValue) {
		const oldValue = this.state;
		if (newValue !== oldValue) {
			const detail = {oldValue, newValue};
			this.setAttribute('state', newValue);
			this.dispatchEvent(new CustomEvent('stateChange', {detail}));
		}
	}

	get imported() {
		return this.state === 'complete';
	}

	get mode() {
		return this.getAttribute('mode') || this.src.host === location.host ? 'same-origin' : 'cors';
	}

	set mode(mode) {
		this.setAttribute('mode', mode);
	}

	get integrity() {
		return this.getAttribute('integrity');
	}

	set integrity(hash) {
		this.setAttribute('integrity', hash);
	}

	get credentials() {
		return this.getAttribute('credentials') || 'omit';
	}

	set credentials(credentials) {
		this.setAttribute('credentials', credentials);
	}

	get cache() {
		return this.getAttribute('cache') || 'default';
	}

	set cache(cache) {
		this.setAttribute('cache', cache);
	}

	get referrer() {
		return this.getAttribute('referrer') || 'client';
	}

	set referrer(referrer) {
		this.setAttribute('referrer', referrer);
	}

	get redirect() {
		return this.hasAttribute('redirect');
	}

	set redirect(val) {
		this.toggleAttribute('redirect', val);
	}

	get symbols() {
		return [...this.querySelectorAll('symbol')];
	}

	get icons() {
		return this.symbols.map(symbol => symbol.id);
	}

	async has(icon) {
		await this.ready();
		return this.symbols.some(symbol => symbol.id === icon);
	}

	async get(icon) {
		const symbol = await this.getSymbol(icon);
		if (symbol instanceof Element) {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

			svg.setAttribute('version', '1.1');
			svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			if (symbol.hasAttribute('viewBox')) {
				svg.setAttribute('viewBox', symbol.getAttribute('viewBox'));
			}
			[...symbol.children].forEach(child => svg.appendChild(child));
			return svg;
		} else {
			throw new Error(`Icon "${icon}" not found`);
		}
	}

	async getUri(icon, {
		width = null,
		height = null,
		fill = null,
	} = {}) {
		const svg = await this.get(icon);
		if (svg instanceof Element) {
			if (typeof height === 'number') {
				svg.setAttribute('height', height);
			}

			if (typeof width === 'number') {
				svg.setAttribute('width', width);
			}

			if (typeof fill === 'string') {
				[...svg.children].forEach(child => {
					if (! child.hasAttribute('fill')) {
						child.setAttribute('fill', fill);
					}
				});
			}

			return `data:image/svg+xml;base64,${btoa(svg.outerHTML)}`;
		}
	}

	async getSymbol(icon) {
		await this.ready();
		const symbol = this.querySelector(`symbol[id="${icon}"]`);
		if (symbol instanceof Element) {
			return symbol.cloneNode(true);
		}
	}

	async ready() {
		return await new Promise((resolve, reject) => {
			if (this.imported) {
				resolve(this);
			} else if (! this.failed) {
				this.addEventListener('load', () => resolve(this), {once: true});
				this.addEventListener('error', err => reject(err.error), {once: true});

				if (this.pending) {
					this.import();
				}
			} else {
				reject(new Error('Rejecting due to previous error'));
			}
		});
	}

	async import() {
		if (this.imported) {
			throw new Error('Already imported');
		} else if (this.failed) {
			throw new Error(`Attempting to import from a "${this.state}" state`);
		} else if (this.hasAttribute('src')) {
			try {
				this.state = 'importing';
				const config = {
					mode: this.mode,
					cache: this.cache,
					referrer: this.referrer,
					credentials: this.credentials,
					redirect: this.redirect ? 'follow' : 'error',
				};
				if (this.hasAttribute('integrity')) {
					config.integrity = this.integrity;
				}

				const resp = await fetch(this.src, config);
				if (resp.ok) {
					if (! resp.headers.get('Content-Type').startsWith('image/svg+xml')) {
						throw new Error(`Invalid Content-Type: ${resp.headers.get('Content-Type')}`);
					}
					const svg = await resp.text();
					const parser = new DOMParser();
					const doc = parser.parseFromString(svg, 'image/svg+xml');
					[...this.children].forEach(child => child.remove());
					this.append(doc.rootElement);
					this.state = 'complete';
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			} catch (err) {
				this.dispatchEvent(new ErrorEvent('error', {
					error: err,
					message: err.message,
					lineno: err.lineNumber,
					colno: err.columnNumber,
					filename: err.fileName,
				}));
			}
		} else {
			throw new Error('No src attribute set to import from');
		}
	}
}

customElements.define('svg-icons', SVGIcons);
