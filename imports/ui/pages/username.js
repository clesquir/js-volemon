import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import '/imports/ui/util/form.js';
import '/imports/ui/util/error-messages.js';

import './username.html';

Template.username.helpers({
	value: function() {
		const user = Meteor.user();

		return user ? user.profile.name : null;
	}
});

Template.username.events({
	'submit form[name=username]': function(e) {
		e.preventDefault();

		const user = Meteor.user();
		const usernameField = $(e.target).find('#username-name-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');
		let hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			usernameField
		]);

		if (!hasErrors) {
			if (usernameField.val().length > 20) {
				addErrorToField(usernameField, USERNAME_TOO_LONG);
				hasErrors = true;
			}

			if (user && !hasErrors) {
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
			}
		}
	}
});

Template.username.rendered = function() {
	this.find('[name=name]').focus();
};
