import {Meteor} from 'meteor/meteor';
import {Profiles} from '/imports/api/profiles/profiles.js';

export const RankController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('ranks');
	},
	data: function() {
		return {
			users: Meteor.users.find(),
			profiles: Profiles.find({}, {sort: [['eloRating', 'desc']]})
		};
	}
});
