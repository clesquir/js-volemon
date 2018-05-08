export default class Skin {
	init() {
	}

	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [];
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad(xSize, ySize) {
		return [];
	}

	/**
	 * @returns {{key: {string}, path: {string}, width: {integer}, height: {integer}}[]}
	 */
	spriteSheetsToLoad() {
		return [];
	}

	/**
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	dataToLoad() {
		return [];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#000000';
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]}
	 */
	backgroundComponents(xSize, ySize) {
		return [];
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {};
	}
}
