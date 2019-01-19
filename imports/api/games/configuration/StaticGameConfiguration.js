import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration';
import GameConfiguration from './GameConfiguration.js';

export default class StaticGameConfiguration extends GameConfiguration {
	constructor() {
		super();

		this.levelConfiguration = LevelConfiguration.defaultConfiguration();
	}
}
