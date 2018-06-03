import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class IndustrialSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'industrial-skin',
				imagePath: '/assets/skin/industrial/texture-atlas.png',
				jsonPath: '/assets/skin/industrial/texture-atlas.json'
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
			{key: 'background', path: `/assets/skin/industrial/background-${background}.png`}
		];
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
			key: 'industrial-skin',
            frame: 'ball'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'industrial-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'industrial-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'industrial-skin',
			hostFrames: ['confettis-juju-nipple', 'confettis-kwak'],
			clientFrames: ['confettis-chateau-nipple', 'confettis-chateau-beard']
		};
	}
}
