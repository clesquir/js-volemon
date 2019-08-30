import ReplayRouteInitiator from '/imports/api/games/replay/ReplayRouteInitiator';
import {Template} from 'meteor/templating';

import './gameReplayControls.html';

Template.gameReplayControls.helpers({
});

Template.gameReplayControls.events({
	'click [data-action=restart-replay]': function() {
		ReplayRouteInitiator.get().restartReplay();
	}
});
