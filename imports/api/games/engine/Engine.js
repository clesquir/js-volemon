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

	addSprite(x, y, key, disableBody = false, frame, debugBody = false) {
	}

	addGroupedSprite(x, y, key, group, disableBody = false, frame, debugBody = false) {
	}

	addTileSprite(x, y, width, height, key, disableBody = true, group, debugBody = false) {
	}
}
