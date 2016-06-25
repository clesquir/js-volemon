import { Constants } from '/lib/constants.js';

Template.login.events({
	'click [data-action=switch-for-create-account]': function(e) {
		var loginForm = document.getElementById('login-form'),
			createAccountForm = document.getElementById('create-account-form');

		removeFieldsInvalidMarkAndSwitchForm(createAccountForm, loginForm);
	},

	'click [data-action=switch-for-log-in]': function(e) {
		var loginForm = document.getElementById('login-form'),
			createAccountForm = document.getElementById('create-account-form');

		removeFieldsInvalidMarkAndSwitchForm(loginForm, createAccountForm);
	},

	'focus input.field-in-error': function(e) {
		removeFieldInvalidMark($(e.target));
	},

	'submit form[name=login]': function(e) {
		e.preventDefault();

		var emailField = $(e.target).find('#login-email-field'),
			emailValue = emailField.val(),
			passwordField = $(e.target).find('#login-password-field'),
			passwordValue = passwordField.val(),
			errorLabelContainer = $(e.target).find('.error-label-container'),
			hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			emailField,
			passwordField
		]);

		if (!hasErrors) {
			Meteor.loginWithPassword(emailValue, passwordValue, function(error) {
				if (error === undefined) {
					if (actionAfterLoginCreateUser) {
						actionAfterLoginCreateUser();
						actionAfterLoginCreateUser = null;
					}
					Session.set('lightbox', null);
				} else {
					errorLabelContainer.show();
					errorLabelContainer.html(error.reason);
				}
			});
		}
	},

	'submit form[name=createAccount]': function(e) {
		e.preventDefault();

		var emailField = $(e.target).find('#create-account-email-field'),
			emailValue = emailField.val(),
			passwordField = $(e.target).find('#create-account-password-field'),
			passwordValue = passwordField.val(),
			passwordConfirmationField = $(e.target).find('#create-account-password-confirmation-field'),
			passwordConfirmationValue = passwordConfirmationField.val(),
			nameField = $(e.target).find('#create-account-name-field'),
			nameValue = nameField.val(),
			errorLabelContainer = $(e.target).find('.error-label-container'),
			invalidEmailErrorMessage = 'Invalid email',
			tooShortPasswordErrorMessage = Constants.TOO_SHORT_PASSWORD_ERROR_MESSAGE,
			confirmationMatchPasswordErrorMessage = Constants.CONFIRMATION_MATCH_PASSWORD_ERROR_MESSAGE,
			hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			emailField,
			passwordField,
			passwordConfirmationField,
			nameField
		]);

		if (!hasErrors && emailValue.indexOf('@') === -1) {
			emailField.addClass('field-in-error');
			emailField.prop('title', invalidEmailErrorMessage);
			errorLabelContainer.show();
			errorLabelContainer.html(invalidEmailErrorMessage);
			hasErrors = true;
		}

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
			Accounts.createUser(
				{email: emailValue, password: passwordValue, profile: {name: nameValue}},
				function(error) {
					if (error === undefined) {
						if (actionAfterLoginCreateUser) {
							actionAfterLoginCreateUser();
							actionAfterLoginCreateUser = null;
						}
						Session.set('lightbox', null);
					} else {
						errorLabelContainer.show();
						errorLabelContainer.html(error.reason);
					}
				}
			);
		}
	}
});

Template.login.rendered = function() {
	this.find('#login-email-field').focus();
};

removeFieldsInvalidMarkAndSwitchForm = function(formToShow, formToHide) {
	var fieldsInError = $(formToShow).find('input.field-in-error'),
		errorLabelContainer = $(formToShow).find('.error-label-container');

	fieldsInError.each(function(index, field) {
		removeFieldInvalidMark($(field));
	});

	$(formToHide).hide();
	removeErrorLabelContainer(errorLabelContainer);
	$(formToShow).show();

	$(formToShow).find('input[name=email]').focus();
};
