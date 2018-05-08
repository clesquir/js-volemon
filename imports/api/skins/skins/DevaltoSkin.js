import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class DevaltoSkin extends Skin {
	/**
	 * @returns {{key: {string}, imagePath: {string}, jsonPath: {string}}[]}
	 */
	atlasJSONHash() {
		return [
			{
				key: 'devalto-skin',
				imagePath: '/assets/skin/devalto/texture-atlas.png',
				jsonPath: '/assets/skin/devalto/texture-atlas.json'
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
			{key: 'background', path: `/assets/skin/devalto/background-${background}.png`}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#83d8e8';
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
		const ballImage = Random.choice(
			[
				'abdellah',
				'cedric',
				'christian',
				'christophe',
				'david',
				'eugenie',
				'francois',
				'jm',
				'jeff',
				'julien',
				'luc',
				'macarena',
				'mathieu',
				'sarah',
				'stephane',
				'sylvain',
				'vincent',
				'yanick',
				'yannick'
			]
		);

		return {
			key: 'devalto-skin',
			frame: 'ball-' + ballImage
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}}
	 */
	netComponent() {
		return {
			key: 'devalto-skin',
			frame: 'net'
		};
	}

	/**
	 * @returns {{key: {string}, frame: {string}}[]}
	 */
	groundComponents() {
		return [
			{
				key: 'devalto-skin',
				frame: 'ground'
			}
		];
	}

	/**
	 * @returns {{key: {string}, hostFrames: {string}[], clientFrames: {string}[]}[]}
	 */
	confettisComponent() {
		return {
			key: 'devalto-skin',
			hostFrames: ['confettis-logalto'],
			clientFrames: ['confettis-logalto']
		};
	}
}
