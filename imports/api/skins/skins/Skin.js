export default class Skin {
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
	 * @returns {string}
	 */
	backgroundColor() {
		return '#000000';
	}

	/**
	 * @returns {{key: {string}, animate: {boolean}}[]}
	 */
	backgroundComponents() {
		return [];
	}
}
