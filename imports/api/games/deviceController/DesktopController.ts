import DeviceController from "./DeviceController";
import CustomKeymaps from "imports/lib/keymaps/CustomKeymaps";
import Keymaps from "imports/lib/keymaps/Keymaps";

export default class DesktopController implements DeviceController {
	private keymaps: Keymaps;
	private keys: {left: string, right: string, up: string, down: string} = {left: null, right: null, up: null, down: null};
	private monitoringStarted: boolean = false;
	private readonly onKeyDown;
	private readonly onKeyUp;

	constructor(keymaps: Keymaps) {
		this.keymaps = keymaps;
		this.onKeyDown = (event) => {
			return this.processKeyDown(event);
		};
		this.onKeyUp = (event) => {
			return this.processKeyUp(event);
		};
	}

	static fromDefaults(): DesktopController {
		return new DesktopController(CustomKeymaps.defaultKeymaps());
	}

	init() {
	}

	startMonitoring() {
		this.monitoringStarted = true;
		window.addEventListener('keydown', this.onKeyDown, true);
		window.addEventListener('keyup', this.onKeyUp, true);
	}

	stop() {
		this.stopMonitoring();
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

	leftPressed(): boolean {
		return this.keys.left !== null;
	}

	rightPressed(): boolean {
		return this.keys.right !== null;
	}

	upPressed(): boolean {
		return this.keys.up !== null;
	}

	downPressed(): boolean {
		return this.keys.down !== null;
	}
}
