import '/imports/ui/util/error-messages.js';
import {
	addErrorToField,
	disableButton,
	removeErrorLabelContainer,
	removeFieldInvalidMark,
	validateFieldsPresenceAndMarkInvalid
} from '/imports/ui/util/form.js';
import {Accounts} from 'meteor/accounts-base';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './passwordChange.html';

Template.passwordChange.events({
	'focus input.field-in-error': function(e) {
		removeFieldInvalidMark($(e.target));
	},

	'submit form[name=passwordChange]': function(e) {
		e.preventDefault();

		const oldPasswordField = $(e.target).find('#password-change-old-password-field');
		const passwordField = $(e.target).find('#password-change-password-field');
		const passwordConfirmationField = $(e.target).find('#password-change-password-confirmation-field');
		const requiredFields = [
			oldPasswordField,
			passwordField,
			passwordConfirmationField
		];
		const errorLabelContainer = $(e.target).find('.error-label-container');

		removeErrorLabelContainer(errorLabelContainer);

		Promise.resolve()
			.then(
				function() {
					if (validateFieldsPresenceAndMarkInvalid($(e.target), requiredFields)) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(
				function() {
					let hasErrors = false;

					if (passwordField.val().length < 6) {
						addErrorToField(passwordField, PASSWORD_TOO_SHORT);
						hasErrors = true;
					}

					if (passwordConfirmationField.val() !== passwordField.val()) {
						addErrorToField(passwordConfirmationField, CONFIRMATION_MUST_MATCH_PASSWORD);
						hasErrors = true;
					}

					if (hasErrors) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(function() {
				disableButton(e, true);
				Accounts.changePassword(oldPasswordField.val(), passwordField.val(), function(error) {
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

Template.passwordChange.rendered = function() {
	this.find('[name=old-password]').focus();
};
