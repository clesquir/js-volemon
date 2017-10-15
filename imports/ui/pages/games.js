import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';

import './games.html';

Template.games.events({
	'click [data-action="go-to-game"]': function() {
		Router.go(Router.routes['game'].url({_id: this._id}));
	}
});
