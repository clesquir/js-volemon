import {UserReactions} from '/imports/api/users/userReactions.js';
import CustomReactions from '/imports/lib/reactions/CustomReactions.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './userReactions.html';

const userReactions = function() {
	const userReactions = UserReactions.findOne({userId: Meteor.userId()});
	const customReactions = CustomReactions.fromUserReactions(userReactions);
	return customReactions.reactions;
};

Template.userReactions.helpers({
	reactions: function() {
		return userReactions();
	}
});

Template.userReactions.events({
	'submit form[name=userReactions]': function(e) {
		e.preventDefault();

		const currentReactions = userReactions();
		const reactionsToUpdate = {};
		const fields = [];

		for (let i = 0; i < currentReactions.length; i++) {
			let field = $(e.target).find('#reaction-text-field-' + currentReactions[i].index);
			fields.push(field);
			reactionsToUpdate['button' + currentReactions[i].index] = field.val();
		}

		Promise.all(
			[
				new Promise(function(resolve, reject) {
					if (validateFieldsPresenceAndMarkInvalid($(e.target), fields)) {
						return reject();
					} else {
						return resolve();
					}
				}),
				new Promise(function(resolve, reject) {
					let hasErrors = false;

					for (let field of fields) {
						if (field.val().length > 20) {
							addErrorToField(field, MAXIMUM_CHARACTERS_OF_20);
							hasErrors = true;
						}
					}

					if (hasErrors) {
						return reject();
					} else {
						return resolve();
					}
				})
			]
		)
			.then(
				function() {
					Meteor.call('updateReactions', reactionsToUpdate, function(error) {
						disableButton(e, false);
						if (error === undefined) {
							Session.set('lightbox', null);
						}
					});
				}
			)
			.catch(function() {});
	}
});
