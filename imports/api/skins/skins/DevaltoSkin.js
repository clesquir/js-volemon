import {Random} from 'meteor/random';
import Skin from '/imports/api/skins/skins/Skin.js';

export default class DevaltoSkin extends Skin {
	/**
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad() {
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

		return [
			{key: 'devalto-bakground', path: '/assets/skin/devalto/background.png'},
			{key: 'ball', path: `/assets/skin/devalto/ball-${ballImage}.png`}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		return '#83d8e8';
	}

	/**
	 * @returns {{key: {string}, animate: {boolean}}[]}
	 */
	backgroundComponents() {
		return [
			{key: 'devalto-bakground'}
		];
	}
}
