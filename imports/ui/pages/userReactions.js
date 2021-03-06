import {UserReactions} from '/imports/api/users/userReactions.js';
import CustomReactions from '/imports/lib/reactions/CustomReactions.js';
import {
	addErrorToField,
	disableButton,
	validateFieldsPresenceAndMarkInvalid
} from '/imports/ui/util/form.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './userReactions.html';

const userReactions = function() {
	const userReactions = UserReactions.findOne({userId: Meteor.userId()});
	const customReactions = CustomReactions.fromUserReactions(userReactions);
	return customReactions.reactions;
};

Template.userReactions.rendered = function() {
	this.find('#reaction-text-field-5').focus();
};

Template.userReactions.helpers({
	reactions: function() {
		return userReactions();
	}
});

const setFromPreset = function(defaultReactions) {
	for (let i = 0; i < defaultReactions.length; i++) {
		let field = $(document).find('#reaction-text-field-' + defaultReactions[i].index);
		field.val(defaultReactions[i].text);
	}
};

Template.userReactions.events({
	'change select[name=presets]': function(e) {
		switch (e.target.value) {
			case 'default':
				setFromPreset(CustomReactions.defaultReactions().reactions);
				break;
			case 'friendly':
				setFromPreset(
					new CustomReactions(
						'Great game!',
						'Nice shot!',
						'You are blessed!',
						'Unexpected!',
						'Come on!',
						'Oopsy!'
					).reactions
				);
				break;
			case 'angry':
				setFromPreset(
					new CustomReactions(
						'Slow clap...',
						'Take that!',
						'Really?!...',
						'Calculated.',
						'ZzzzZzzzZz...',
						'Wow...'
					).reactions
				);
				break;
		}
	},

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

		Promise.resolve()
			.then(
				function() {
					if (validateFieldsPresenceAndMarkInvalid($(e.target), fields)) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(
				function() {
					let hasErrors = false;

					for (let field of fields) {
						if (field.val().length > 20) {
							addErrorToField(field, MAXIMUM_CHARACTERS_OF_20);
							hasErrors = true;
						}
					}

					if (hasErrors) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(
				function() {
					disableButton(e, true);
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
