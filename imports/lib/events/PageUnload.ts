import Event from './Event';

export default class PageUnload implements Event {
	event;

	constructor(event) {
		this.event = event;
	}

	static getClassName(): string {
		return 'PageUnload';
	}

	getClassName(): string {
		return PageUnload.getClassName();
	}
}
