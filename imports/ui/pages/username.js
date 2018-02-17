import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import '/imports/ui/util/error-messages.js';
import '/imports/ui/util/form.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './username.html';

Template.username.helpers({
	value: function() {
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

		return userConfiguration ? userConfiguration.name : null;
	}
});

Template.username.events({
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

Template.username.rendered = function() {
	this.find('[name=name]').focus();
};
