import DeviceController from "./DeviceController";

export default class MobileController implements DeviceController {
	parentSelector: string;
	controllerSelector: string;
	controllerLeft: string;
	controllerRight: string;
	controllerUp: string;
	controllerDown: string;
	events: {left: string[], right: string[], up: string[], down: string[]} = {left: [], right: [], up: [], down: []};

	constructor(parentSelector, controllerClass) {
		this.parentSelector = parentSelector;
		this.controllerSelector = `.${controllerClass}`;
		this.controllerLeft = controllerClass + '-left';
		this.controllerRight = controllerClass + '-right';
		this.controllerUp = controllerClass + '-up';
		this.controllerDown = controllerClass + '-down';

		this.events = {
			left: [],
			right: [],
			up: [],
			down: []
		};
	}

	init() {
	}

	startMonitoring() {
		$(document).find(this.parentSelector).on(
			'touchstart',
			this.controllerSelector,
			(e) => {
				e.preventDefault();
				this.onPressDown(e.originalEvent);
			}
		);
		$(document).find(this.parentSelector).on(
			'touchmove',
			this.controllerSelector,
			(e) => {
				e.preventDefault();
				this.onPressDown(e.originalEvent);
			}
		);
		$(document).find(this.parentSelector).on(
			'touchend',
			this.controllerSelector,
			(e) => {
				e.preventDefault();
				this.onPressUp(e.originalEvent);
			}
		);
		$(document).find(this.parentSelector).on(
			'touchcancel',
			this.controllerSelector,
			(e) => {
				e.preventDefault();
				this.onPressUp(e.originalEvent);
			}
		);
	}

	stop() {
		this.stopMonitoring();
	}

	stopMonitoring() {
		$(document).find(this.parentSelector).off('touchstart touchmove touchend touchcancel');
	}

	leftPressed(): boolean {
		return this.events.left.length > 0;
	}

	rightPressed(): boolean {
		return this.events.right.length > 0;
	}

	upPressed(): boolean {
		return this.events.up.length > 0;
	}

	downPressed(): boolean {
		return this.events.down.length > 0;
	}

	private onPressDown(originalEvent) {
		const touches = originalEvent.changedTouches[0];
		const realTarget = document.elementFromPoint(touches.clientX, touches.clientY);

		switch ($(realTarget).attr('class')) {
			case this.controllerLeft:
				this.addPressed('left', originalEvent);
				this.removePressed('right', originalEvent);
				this.removePressed('up', originalEvent);
				this.removePressed('down', originalEvent);
				break;
			case this.controllerRight:
				this.addPressed('right', originalEvent);
				this.removePressed('left', originalEvent);
				this.removePressed('up', originalEvent);
				this.removePressed('down', originalEvent);
				break;
			case this.controllerUp:
				this.addPressed('up', originalEvent);
				this.removePressed('left', originalEvent);
				this.removePressed('right', originalEvent);
				this.removePressed('down', originalEvent);
				break;
			case this.controllerDown:
				this.addPressed('down', originalEvent);
				this.removePressed('left', originalEvent);
				this.removePressed('right', originalEvent);
				this.removePressed('up', originalEvent);
				break;
		}

		this.colorizeOnPress();
	}

	private onPressUp(originalEvent) {
		this.removePressed('left', originalEvent);
		this.removePressed('right', originalEvent);
		this.removePressed('up', originalEvent);
		this.removePressed('down', originalEvent);

		this.colorizeOnPress();
	}

	private addPressed(key: string, originalEvent) {
		if (!this.events[key]) {
			throw `${key} do not exist.`;
		}
		const identifier = originalEvent.changedTouches[0].identifier;
		if (this.events[key].indexOf(identifier) === -1) {
			this.events[key].push(identifier);
		}
	}

	private removePressed(key: string, originalEvent) {
		if (!this.events[key]) {
			throw `${key} do not exist.`;
		}
		const identifier = originalEvent.changedTouches[0].identifier;
		const index = this.events[key].indexOf(identifier);
		if (index !== -1) {
			this.events[key].splice(index, 1);
		}
	}

	private colorizeOnPress() {
		const controller = $(document).find(this.parentSelector);

		this.colorizeButton(controller.find(`.${this.controllerLeft}`), this.leftPressed());
		this.colorizeButton(controller.find(`.${this.controllerRight}`), this.rightPressed());
		this.colorizeButton(controller.find(`.${this.controllerUp}`), this.upPressed());
		this.colorizeButton(controller.find(`.${this.controllerDown}`), this.downPressed());
	}

	private colorizeButton(button, isPressed) {
		if (isPressed) {
			button.addClass('mobile-controller-pressed');
		} else {
			button.removeClass('mobile-controller-pressed');
		}
	}
}
