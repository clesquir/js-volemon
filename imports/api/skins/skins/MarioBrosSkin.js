import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class MarioBrosSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'mario-bros-skin',
				imagePath: '/assets/skin/mario-bros/texture-atlas.png',
				jsonPath: '/assets/skin/mario-bros/texture-atlas.json'
			}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#6b8cff';
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]}
	 */
	backgroundComponents() {
		return [
			{
				key: 'mario-bros-skin',
				frame: 'background-mountain',
				x: 145,
				y: 402,
				width: 200,
				height: 88
			},
			{
				key: 'mario-bros-skin',
				frame: 'background-bush',
				x: 490,
				y: 450,
				width: 120,
				height: 40
			},
			{
				key: 'mario-bros-skin',
				frame: 'background-cloud',
				x: 550,
				y: 86,
				width: 160,
				height: 60
			}
		];
	}

	/**
	 * @returns {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}}}
	 */
	ballComponent() {
		return {
			key: 'mario-bros-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3', 'ball-4'],
				speed: 5
			}
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'mario-bros-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'mario-bros-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'mario-bros-skin',
			hostFrames: ['confettis-goomba-light'],
			clientFrames: ['confettis-goomba-dark']
		};
	}
}
