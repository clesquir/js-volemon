import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import GameConfiguration from './GameConfiguration.js';

export default class StaticLevelGameConfiguration extends GameConfiguration {
	/**
	 * @param {LevelConfiguration} levelConfiguration
	 */
	constructor(levelConfiguration) {
		super();
		this.levelConfiguration = levelConfiguration;
	}
}
