export default class Engine {
	/**
	 * {GameConfiguration} gameConfiguration
	 * {DeviceController} deviceController
	 */
	constructor(gameConfiguration, deviceController) {
		this.gameConfiguration = gameConfiguration;
		this.deviceController = deviceController;
	}

	loadImage(key, path) {
	}

	loadSpriteSheet(key, path, width, height) {
	}

	loadData(key, path) {
	}

	changeBackgroundColor(hex) {
	}

	addTileSprite(x, y, width, height, key, group, disableBody, debugBody) {
	}
}
