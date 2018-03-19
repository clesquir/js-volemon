import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class JujuWorldSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'juju-world-skin',
				imagePath: '/assets/skin/juju-world/texture-atlas.png',
				jsonPath: '/assets/skin/juju-world/texture-atlas.json'
			}
		];
	}

	/**
	 * @param xSize
	 * @param ySize
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]}
	 */
	backgroundComponents(xSize, ySize) {
		return [
			{key: 'juju-world-skin', frame: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {
			key: 'juju-world-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3', 'ball-4', 'ball-5', 'ball-6', 'ball-7', 'ball-8'],
				speed: 5
			}
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'juju-world-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'juju-world-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'juju-world-skin',
			hostFrames: ['confettis-juju-nipple', 'confettis-kwak'],
			clientFrames: ['confettis-chateau-nipple', 'confettis-chateau-beard']
		};
	}
}
