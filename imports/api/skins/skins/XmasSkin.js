import Skin from '/imports/api/skins/skins/Skin.js';

export default class XmasSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'xmas-skin',
				imagePath: '/assets/skin/xmas/texture-atlas.png',
				jsonPath: '/assets/skin/xmas/texture-atlas.json'
			}
		];
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad(xSize, ySize) {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/xmas/background-${background}.png`}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#00ccff';
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]}
	 */
	backgroundComponents(xSize, ySize) {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {
			key: 'xmas-skin',
			frame: 'ball'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'xmas-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'xmas-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'xmas-skin',
			hostFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4'],
			clientFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4']
		};
	}
}
