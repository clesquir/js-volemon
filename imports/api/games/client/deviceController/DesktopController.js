import DeviceController from '/imports/api/games/client/deviceController/DeviceController.js';

export default class DesktopController extends DeviceController {
	/**
	 * @param {Keymaps} keymaps
	 */
	constructor(keymaps) {
		super();
		this.keymaps = keymaps;
		this.keys = {left: null, right: null, up: null, down: null};
		this.monitoringStarted = false;
		this.onKeyDown = (event) => {
			event.preventDefault();
			return this.processKeyDown(event);
		};
		this.onKeyUp = (event) => {
			event.preventDefault();
			return this.processKeyUp(event);
		};
	}

	startMonitoring() {
		this.monitoringStarted = true;
		window.addEventListener('keydown', this.onKeyDown, true);
		window.addEventListener('keyup', this.onKeyUp, true);
	}

	stopMonitoring() {
		if (this.monitoringStarted) {
			window.removeEventListener('keydown', this.onKeyDown, true);
			window.removeEventListener('keyup', this.onKeyUp, true);
			this.monitoringStarted = false;
		}
	}

	processKeyDown(event) {
		const keyCode = event.keyCode;

		if (this.keymaps.monitors(keyCode)) {
			const mapping = this.keymaps.mappingForKeyCode(keyCode);
			this.keys[mapping] = keyCode;
		}
	}

	processKeyUp(event) {
		const keyCode = event.keyCode;

		if (this.keymaps.monitors(keyCode)) {
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
