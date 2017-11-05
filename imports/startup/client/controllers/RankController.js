import {Meteor} from 'meteor/meteor';

export const RankController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('ranks');
	}
});
