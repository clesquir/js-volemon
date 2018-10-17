import Skin from '/imports/api/skins/skins/Skin.js';
import {Random} from 'meteor/random';

export default class HalloweenSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'halloween-skin',
				imagePath: '/assets/skin/halloween/texture-atlas.png',
				jsonPath: '/assets/skin/halloween/texture-atlas.json'
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
			{key: 'background', path: `/assets/skin/halloween/background-${background}.png`}
		];
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]}
	 */
	backgroundComponents(xSize, ySize) {
		return [
			{
				key: 'background',
				x: 0,
				y: 0,
				width: xSize,
				height: ySize
			},
			{
				key: 'halloween-skin',
				frame: 'tombs-1',
				x: 50,
				y: ySize - 165,
				width: 154,
				height: 122
			},
			{
				key: 'halloween-skin',
				frame: 'tombs-2',
				x: xSize - 225,
				y: ySize - 150,
				width: 163,
				height: 100
			}
		];
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {
			key: 'halloween-skin',
			frame: 'ball'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'halloween-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'halloween-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'halloween-skin',
			hostFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4', 'confettis-5'],
			clientFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4', 'confettis-5']
		};
	}
}
