export default class Plugin {
	start() {
	}

	init() {
	}

	/**
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad() {
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
	 * @returns {{color: {string}, opacity: {float}}[]}
	 */
	backgroundColorModifier() {
		return [];
	}

	/**
	 * @returns {{key: {string}, animate: {boolean}}[]}
	 */
	backgroundComponents() {
		return [];
	}

	/**
	 * @returns {string[]}
	 */
	groundComponents() {
		return [];
	}
}
