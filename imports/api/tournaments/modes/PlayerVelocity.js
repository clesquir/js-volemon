import {PLAYER_VELOCITY_X_ON_MOVE} from '/imports/api/games/constants.js';
import Classic from '/imports/api/tournaments/modes/Classic.js';

export default class PlayerVelocity extends Classic {
	overridesPlayerXVelocity() {
		return true;
	}

	playerXVelocity() {
		return PLAYER_VELOCITY_X_ON_MOVE * 2;
	}
}
