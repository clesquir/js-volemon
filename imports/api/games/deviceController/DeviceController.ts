export default interface DeviceController {
	init();

	startMonitoring();

	stop();

	stopMonitoring();

	leftPressed(): boolean;

	rightPressed(): boolean;

	upPressed(): boolean;

	downPressed(): boolean;

	displayPlayerNamesPressed(): boolean;
}
