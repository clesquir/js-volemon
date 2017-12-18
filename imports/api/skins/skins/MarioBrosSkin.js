import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class MarioBrosSkin extends Skin {
	/**
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad() {
		return [
			{key: 'mario-bros-background', path: '/assets/skin/mario-bros/background.png'},
			{key: 'mario-bros-ground', path: `/assets/skin/mario-bros/ground.png`},
			{key: 'net', path: `/assets/skin/mario-bros/net.png`},
			{key: 'ball', path: `/assets/skin/mario-bros/ball.png`}
		];
	}

	/**
	 * @returns {{key: {string}, path: {string}, width: {integer}, height: {integer}}[]}
	 */
	spriteSheetsToLoad() {
		return [
			{key: 'confettis', path: '/assets/skin/mario-bros/confettis.png', width: 10, height: 10}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#6b8cff';
	}

	/**
	 * @returns {{key: {string}, animate: {boolean}}[]}
	 */
	backgroundComponents() {
		return [
			{key: 'mario-bros-background'}
		];
	}

	/**
	 * @returns {string[]}
	 */
	groundComponents() {
		return [
			'mario-bros-ground'
		];
	}
}
