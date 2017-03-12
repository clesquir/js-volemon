import {Accounts} from 'meteor/accounts-base';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import '/imports/ui/util/form.js';
import '/imports/ui/util/error-messages.js';

Template.passwordChange.events({
	'focus input.field-in-error': function(e) {
		removeFieldInvalidMark($(e.target));
	},

	'submit form[name=passwordChange]': function(e) {
		e.preventDefault();

		const oldPasswordField = $(e.target).find('#password-change-old-password-field');
		const passwordField = $(e.target).find('#password-change-password-field');
		const passwordConfirmationField = $(e.target).find('#password-change-password-confirmation-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');
		let hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			oldPasswordField,
			passwordField,
			passwordConfirmationField
		]);

		if (!hasErrors) {
			if (passwordField.val().length < 6) {
				addErrorToField(passwordField, PASSWORD_TOO_SHORT);
				hasErrors = true;
			}

			if (passwordConfirmationField.val() != passwordField.val()) {
				addErrorToField(passwordConfirmationField, CONFIRMATION_MUST_MATCH_PASSWORD);
				hasErrors = true;
			}

			if (!hasErrors) {
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
			}
		}
	}
});

Template.passwordChange.rendered = function() {
	this.find('[name=old-password]').focus();
};
