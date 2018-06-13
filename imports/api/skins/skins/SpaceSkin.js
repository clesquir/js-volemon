import Skin from '/imports/api/skins/skins/Skin.js';
import {Random} from 'meteor/random';

export default class SpaceSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'space-skin',
				imagePath: '/assets/skin/space/texture-atlas.png',
				jsonPath: '/assets/skin/space/texture-atlas.json'
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
			{key: 'background', path: `/assets/skin/space/background-${background}.png`}
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
			key: 'space-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3'],
				speed: 10
			}
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'space-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'space-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'space-skin',
			hostFrames: ['explosion-1', 'explosion-2'],
			clientFrames: ['explosion-1', 'explosion-2']
		};
	}
}
