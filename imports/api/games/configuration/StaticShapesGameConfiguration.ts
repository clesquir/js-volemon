import GameConfiguration from './GameConfiguration';

export default class StaticShapesGameConfiguration extends GameConfiguration {
	private readonly _listOfShapes: string[] = [];

	constructor(listOfShapes: string[] = []) {
		super();
		this._listOfShapes = listOfShapes;
	}

	listOfShapes(): string[] {
		return this._listOfShapes;
	}
}
