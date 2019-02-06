import GameConfiguration from './GameConfiguration';
import LevelConfiguration from "../levelConfiguration/LevelConfiguration";

export default class StaticShapesGameConfiguration extends GameConfiguration {
	_listOfShapes: string[] = [];

	constructor() {
		super();

		this.levelConfiguration = LevelConfiguration.defaultConfiguration();
	}

	setListOfShapes(listOfShapes: string[]) {
		this._listOfShapes = listOfShapes;
	}

	listOfShapes(): string[] {
		return this._listOfShapes;
	}
}
