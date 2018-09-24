export default class SVGIcons extends HTMLElement {
	constructor() {
		super();
		this.imported = false;
		this.hidden = true;
		if (this.hasAttribute('src')) {
			this.import().catch(console.error);
		}
	}

	get src() {
		return this.hasAttributes('src')
			? new URL(this.getAttribute('src'), this.ownerDocument.baseURI)
			: undefined;
	}

	set src(src) {
		this.imported = false;
		this.setAttribute('src', src);
		this.import();
	}

	get imported() {
		return this.hasAttribute('imported');
	}

	set imported(val) {
		this.toggleAttribute('imported', !!val);
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
		return await new Promise(resolve => {
			if (this.imported) {
				resolve(this);
			} else {
				this.addEventListener('load', () => resolve(this), {once: true});
			}
		});
	}

	async import() {
		if (this.imported) {
			throw new Error('Already imported');
		} else if (this.hasAttribute('src')) {
			const resp = await fetch(this.src);
			const svg = await resp.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(svg, 'image/svg+xml');
			[...this.children].forEach(child => child.remove());
			this.append(doc.rootElement);
			this.dispatchEvent(new Event('load'));
			this.imported = true;
		} else {
			throw new Error('No src attribute set to import from');
		}
	}
}

customElements.define('svg-icons', SVGIcons);
