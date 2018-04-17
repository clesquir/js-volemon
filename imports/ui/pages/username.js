import {USERNAME_CHANGE_FREQUENCY} from '/imports/api/users/constants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import '/imports/ui/util/error-messages.js';
import '/imports/ui/util/form.js';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './username.html';

Template.username.rendered = function() {
	if (canChangeUsername()) {
		this.find('[name=name]').focus();
	}
};

Template.username.helpers({
	canChangeUsername: function() {
		return canChangeUsername();
	},

	value: function() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		return userConfiguration ? userConfiguration.name : null;
	},

	lastUsernameUpdate: function() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		if (userConfiguration && userConfiguration.lastUsernameUpdate) {
			return Moment.moment(userConfiguration.lastUsernameUpdate).format('YYYY-MM-DD');
		}

		return '';
	}
});

Template.username.events({
	'click [data-action=close-username]': function() {
		Session.set('lightbox', null);
	},

	'submit form[name=username]': function(e) {
		e.preventDefault();

		const usernameField = $(e.target).find('#username-name-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');

		removeErrorLabelContainer(errorLabelContainer);

		Promise.resolve()
			.then(
				function() {
					if (validateFieldsPresenceAndMarkInvalid($(e.target), [usernameField])) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(
				function() {
					if (usernameField.val().length > 20) {
						addErrorToField(usernameField, MAXIMUM_CHARACTERS_OF_20);
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(function() {
				disableButton(e, true);
				Meteor.call('updateUserName', usernameField.val(), function(error) {
					disableButton(e, false);
					if (error === undefined) {
						Session.set('lightbox', null);
					} else {
						errorLabelContainer.show();
						errorLabelContainer.html(error.reason);
					}
				});
			})
			.catch(function() {});
	}
});

const canChangeUsername = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return (
		userConfiguration &&
		(
			!userConfiguration.lastUsernameUpdate ||
			userConfiguration.lastUsernameUpdate + USERNAME_CHANGE_FREQUENCY <= getUTCTimeStamp()
		)
	);
};
