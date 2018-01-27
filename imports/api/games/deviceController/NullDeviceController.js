import DeviceController from '/imports/api/games/deviceController/DeviceController.js';

export default class NullDeviceController extends DeviceController {
	init() {
	}

	startMonitoring() {
	}

	stop() {
	}

	stopMonitoring() {
	}

	leftPressed() {
		return false;
	}

	rightPressed() {
		return false;
	}

	upPressed() {
		return false;
	}

	downPressed() {
		return false;
	}
}
