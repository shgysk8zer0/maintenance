const DAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export default class DateTimeElement extends HTMLTimeElement {
	constructor() {
		super();

		if (this.valid) {
			this.textContent = this.value[this.format];
		} else {
			this.value = new Date();
		}

		if (this.live) {
			this.timer = setInterval(() => this.seconds++, 1000);
		} else {
			this.timer = null;
		}
	}

	toString() {
		return this.dateTimeString;
	}

	get live() {
		return this.hasAttribute('live');
	}

	set live(val) {
		this.toggleAttribute('live', val);

		if (this.live) {
			if (this.timer !== null) {
				clearInterval(this.timer);
			}
			this.timer = setInterval(() => this.seconds++, 1000);
		} else if (this.timer !== null) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	get valid() {
		return ! Number.isNaN(Date.parse(this.value));
	}

	get value() {
		return new Date(this.dateTime);
	}

	set value(date) {
		if (! (date instanceof Date)) {
			date = new Date(date);
		}
		if (! Number.isNaN(date)) {
			this.dateTime = date.toISOString();
			this.textContent = date[this.format]();
		}
	}

	get format() {
		return this.hasAttribute('format') ? this.getAttribute('format') : 'toLocaleString';
	}

	set format(format) {
		if (Date.prototype[format] instanceof Function) {
			this.setAttribute('format', format);
		}
	}

	get year() {
		return this.value.getFullYear();
	}

	set year(year) {
		this.value = this.value.setFullYear(year);
	}

	get month() {
		return MONTHS[this.value.getMonth()];
	}

	set month(month) {
		if (typeof month !== 'number') {
			if (MONTHS.includes(month)) {
				this.value = this.value.setMonth(MONTHS.indexOf(month));
			}
		} else {
			this.value = this.value.setMonth(month - 1);
		}
	}

	get date() {
		return this.value.getDate();
	}

	set date(date) {
		this.value = this.value.setDate(date);
	}

	get day() {
		return DAYS[this.value.getDay()];
	}

	get hours() {
		return this.value.getHours();
	}

	set hours(hour) {
		this.value = this.value.setHours(hour);
	}

	get AMPM() {
		return this.hours > 11 ? 'PM' : 'AM';
	}

	get minutes() {
		return this.value.getMinutes();
	}

	set minutes(min) {
		this.value = this.value.setMinutes(min);
	}

	get seconds() {
		return this.value.getSeconds();
	}

	set seconds(sec) {
		this.value = this.value.setSeconds(sec);
	}

	get timeString() {
		return this.value.toLocaleTimeString();
	}

	get time() {
		return this.timeString;
	}

	get dateString() {
		return this.value.toLocaleDateString();
	}

	get dateTimeString() {
		return this.value.toLocaleString();
	}

	get ISO() {
		return this.value.toISOString();
	}

	get UTC() {
		return this.value.toUTCString();
	}

	get GMT() {
		return this.value.toGMTString();
	}

	get timeZoneOffset() {
		return this.value.getTimezoneOffset();
	}
}

customElements.define('date-time', DateTimeElement, {extends: 'time'});
