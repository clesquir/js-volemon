import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {UserReactions} from '/imports/api/users/userReactions.js';
import CustomReactions from '/imports/lib/reactions/CustomReactions.js';

import './userReactions.html';

const userReactions = function() {
	const userReactions = UserReactions.findOne({userId: Meteor.userId()});
	const customReactions = CustomReactions.fromUserReactions(userReactions.reactions);
	return customReactions.reactionsList;
};

Template.userReactions.helpers({
	reactions: function() {
		return userReactions();
	}
});

Template.userReactions.events({
	'submit form[name=userReactions]': function(e) {
		e.preventDefault();

		const errorLabelContainer = $(e.target).find('.error-label-container');
		const userReactions = UserReactions.findOne({userId: Meteor.userId()});
		const customReactions = CustomReactions.fromUserReactions(userReactions.reactions);
		let reactions = customReactions.reactionsList;

		let newReactions = {};
		let field;

		for (let i = 0; i < reactions.length; i++) {
			field = $(e.target).find('#reaction-text-field-'+reactions[i].index);
			newReactions['button'+reactions[i].index] = field.val();
		}

		Meteor.call('updateReactions', newReactions, function(error) {
			disableButton(e, false);
			if (error === undefined) {
				Session.set('lightbox', null);
			} else {
				errorLabelContainer.show();
				errorLabelContainer.html(error.reason);
			}
		});
	}
});
