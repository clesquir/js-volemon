import GameConfiguration from './GameConfiguration.js';

export default class StaticShapesGameConfiguration extends GameConfiguration {
	/**
	 * @param {string[]} listOfShapes
	 */
	constructor(listOfShapes = []) {
		super();
		this._listOfShapes = listOfShapes;
	}

	/**
	 * @returns {string[]}
	 */
	listOfShapes() {
		return this._listOfShapes;
	}
}
