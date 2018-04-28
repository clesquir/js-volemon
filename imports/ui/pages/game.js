import {isGameStatusOnGoing} from '/imports/api/games/utils.js';
import {Template} from 'meteor/templating';

import './game.html';

Template.game.helpers({
	isGameOnGoing: function() {
		return isGameStatusOnGoing(this.game.status);
	}
});
