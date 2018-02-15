import {Template} from 'meteor/templating';
import {UserReactions} from '/imports/api/users/userReactions.js';
import CustomReactions from '/imports/lib/reactions/CustomReactions.js';

import './reactionsList.html';

Template.reactionsList.helpers({
	reactions: function() {
        const userReactions = UserReactions.findOne({userId: Meteor.userId()});
        const customReactions = CustomReactions.fromUserReactions(userReactions.reactions);
		return [
			{
				index: 1,
				icon: 'wow'
			},
			{
				index: 2,
				icon: 'angry'
			},
			{
				index: 3,
				icon: 'sob'
			},
			{
				index: 4,
				icon: 'laugh'
			}
		].concat(customReactions.reactionsList);
	}
});
