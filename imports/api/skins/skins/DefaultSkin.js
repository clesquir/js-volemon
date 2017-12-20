import Skin from '/imports/api/skins/skins/Skin.js';

export default class DefaultSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'default-skin',
				imagePath: '/assets/skin/default/texture-atlas.png',
				jsonPath: '/assets/skin/default/texture-atlas.json'
			}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#9ad3de';
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {
			key: 'default-skin',
			frame: 'ball'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'default-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'default-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'default-skin',
			hostFrames: ['confettis-red-1', 'confettis-red-2', 'confettis-red-3', 'confettis-red-4', 'confettis-red-5'],
			clientFrames: ['confettis-blue-1', 'confettis-blue-2', 'confettis-blue-3', 'confettis-blue-4', 'confettis-blue-5']
		};
	}
}
