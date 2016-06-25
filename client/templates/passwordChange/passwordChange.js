import { Constants } from '/lib/constants.js';

Template.passwordChange.events({
	'focus input.field-in-error': function(e) {
		removeFieldInvalidMark($(e.target));
	},

	'submit form[name=passwordChange]': function(e) {
		e.preventDefault();

		var oldPasswordField = $(e.target).find('#password-change-old-password-field'),
			oldPasswordValue = oldPasswordField.val(),
			passwordField = $(e.target).find('#password-change-password-field'),
			passwordValue = passwordField.val(),
			passwordConfirmationField = $(e.target).find('#password-change-password-confirmation-field'),
			passwordConfirmationValue = passwordConfirmationField.val(),
			errorLabelContainer = $(e.target).find('.error-label-container'),
			tooShortPasswordErrorMessage = Constants.TOO_SHORT_PASSWORD_ERROR_MESSAGE,
			confirmationMatchPasswordErrorMessage = Constants.CONFIRMATION_MATCH_PASSWORD_ERROR_MESSAGE,
			hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			oldPasswordField,
			passwordField,
			passwordConfirmationField
		]);

		if (!hasErrors && passwordValue.length < 6) {
			passwordField.addClass('field-in-error');
			passwordField.prop('title', tooShortPasswordErrorMessage);
			errorLabelContainer.show();
			errorLabelContainer.html(tooShortPasswordErrorMessage);
			hasErrors = true;
		}

		if (!hasErrors && passwordConfirmationValue != passwordValue) {
			passwordConfirmationField.addClass('field-in-error');
			passwordConfirmationField.prop('title', confirmationMatchPasswordErrorMessage);
			errorLabelContainer.show();
			errorLabelContainer.html(confirmationMatchPasswordErrorMessage);
			hasErrors = true;
		}

		if (!hasErrors) {
			Accounts.changePassword(oldPasswordValue, passwordValue, function (error) {
				if (error === undefined) {
					Session.set('lightbox', null);
				} else {
					errorLabelContainer.show();
					errorLabelContainer.html(error.reason);
				}
			});
		}
	}
});

Template.passwordChange.rendered = function() {
	this.find('[name=old-password]').focus();
};
