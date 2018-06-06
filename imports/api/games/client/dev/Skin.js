import Dev from '/imports/api/games/client/dev/Dev.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {Random} from 'meteor/random';

export default class Skin extends Dev {
	beforeStart() {
		this.gameConfiguration.levelConfiguration = LevelConfiguration.fromMode(Session.get('dev.skin.currentMode'));
		this.gameSkin = new GameSkin(SkinFactory.fromId(Session.get('dev.skin.currentSkin')), []);
	}
}
