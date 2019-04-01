import LevelConfiguration from '../levelConfiguration/LevelConfiguration';
import GameConfiguration from './GameConfiguration';

export default class StaticGameConfiguration extends GameConfiguration {
	constructor() {
		super();

		this.levelConfiguration = LevelConfiguration.defaultConfiguration();
	}
}
