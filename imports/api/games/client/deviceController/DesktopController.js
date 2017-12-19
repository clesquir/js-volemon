import DeviceController from '/imports/api/games/client/deviceController/DeviceController.js';

export default class DesktopController extends DeviceController {
	/**
	 * @param {Keymaps} keymaps
	 */
	constructor(keymaps) {
		super();
		this.keymaps = keymaps;
		this.keys = {left: [], right: [], up: [], down: []};
		this.onKeyDown = (event) => {
			return this.processKeyDown(event);
		};
		this.onKeyUp = (event) => {
			return this.processKeyUp(event);
		};
	}

	startMonitoring() {
		window.addEventListener('keydown', this.onKeyDown, true);
		window.addEventListener('keyup', this.onKeyUp, true);
	}

	stopMonitoring() {
		window.removeEventListener('keydown', this.onKeyDown);
		window.removeEventListener('keyup', this.onKeyUp);
	}

	processKeyDown(event) {
		const keyCode = event.keyCode;

		if (this.keymaps.monitors(keyCode)) {
			event.preventDefault();

			const mapping = this.keymaps.mappingForKeyCode(keyCode);
			this.keys[mapping].push(keyCode);
		}
	}

	processKeyUp(event) {
		const keyCode = event.keyCode;

		if (this.keymaps.monitors(keyCode)) {
			event.preventDefault();

			const mapping = this.keymaps.mappingForKeyCode(keyCode);
			this.keys[mapping] = this.keys[mapping].filter(item => item !== keyCode);
		}
	}

	leftPressed() {
		return this.keys.left.length > 0;
	}

	rightPressed() {
		return this.keys.right.length > 0;
	}

	upPressed() {
		return this.keys.up.length > 0;
	}

	downPressed() {
		return this.keys.down.length > 0;
	}
}
