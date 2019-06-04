import DeviceController from "./DeviceController";

export default class NullDeviceController implements DeviceController {
	init() {
	}

	startMonitoring() {
	}

	stop() {
	}

	stopMonitoring() {
	}

	leftPressed(): boolean {
		return false;
	}

	rightPressed(): boolean {
		return false;
	}

	upPressed(): boolean {
		return false;
	}

	downPressed(): boolean {
		return false;
	}

	displayPlayerNamesPressed(): boolean {
		return false;
	}
}
