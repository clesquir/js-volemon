import DeviceController from '/imports/api/games/client/deviceController/DeviceController.js';

export default class DesktopController extends DeviceController {
	/**
	 * @param {Keymaps} keymaps
	 */
	constructor(keymaps) {
		super();
		this.keymaps = keymaps;
		this.keys = {left: null, right: null, up: null, down: null};
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
			this.keys[mapping] = keyCode;
		}
	}

	processKeyUp(event) {
		const keyCode = event.keyCode;

		if (this.keymaps.monitors(keyCode)) {
			event.preventDefault();

			const mapping = this.keymaps.mappingForKeyCode(keyCode);
			this.keys[mapping] = null;
		}
	}

	leftPressed() {
		return this.keys.left !== null;
	}

	rightPressed() {
		return this.keys.right !== null;
	}

	upPressed() {
		return this.keys.up !== null;
	}

	downPressed() {
		return this.keys.down !== null;
	}
}
