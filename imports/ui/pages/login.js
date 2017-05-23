import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import '/imports/ui/util/form.js';
import '/imports/ui/util/error-messages.js';

import './login.html';

Template.login.events({
	'click [data-action=switch-for-create-account]': function() {
		const loginForm = document.getElementById('login-form');
		const createAccountForm = document.getElementById('create-account-form');

		removeFieldsInvalidMarkAndSwitchForm(createAccountForm, loginForm);
	},

	'click [data-action=switch-for-forgot-password]': function() {
		const loginForm = document.getElementById('login-form');
		const forgotPasswordForm = document.getElementById('forgot-password-form');

		removeFieldsInvalidMarkAndSwitchForm(forgotPasswordForm, loginForm);
	},

	'click [data-action=switch-for-log-in]': function() {
		const loginForm = document.getElementById('login-form');
		const createAccountForm = document.getElementById('create-account-form');

		removeFieldsInvalidMarkAndSwitchForm(loginForm, createAccountForm);
	},

	'click [data-action=close-login]': function() {
		actionAfterLoginCreateUser = null;
		Session.set('lightbox', null);
	},

	'focus input.field-in-error': function(e) {
		removeFieldInvalidMark($(e.target));
	},

	'submit form[name=login]': function(e) {
		e.preventDefault();

		const emailField = $(e.target).find('#login-email-field');
		const passwordField = $(e.target).find('#login-password-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');
		let hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			emailField,
			passwordField
		]);

		if (!hasErrors) {
			disableButton(e, true);
			Meteor.loginWithPassword(emailField.val(), passwordField.val(), function(error) {
				disableButton(e, false);
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

	'submit form[name=forgotPassword]': function(e) {
		e.preventDefault();

		const form = document.getElementById('forgot-password-form');
		const emailField = $(e.target).find('#forgot-password-email-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');
		let hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			emailField
		]);

		if (!hasErrors) {
			disableButton(e, true);
			Meteor.call('sendUserPasswordToken', emailField.val(), function(error) {
				disableButton(e, false);
				if (error === undefined) {
					$(form).hide();
					removeErrorLabelContainer(errorLabelContainer);
					$(document.getElementById('password-token-sent-form')).show();
				} else {
					errorLabelContainer.show();
					errorLabelContainer.html(error.reason);
				}
			});
		}
	},

	'submit form[name=createAccount]': function(e) {
		e.preventDefault();

		const emailField = $(e.target).find('#create-account-email-field');
		const passwordField = $(e.target).find('#create-account-password-field');
		const passwordConfirmationField = $(e.target).find('#create-account-password-confirmation-field');
		const nameField = $(e.target).find('#create-account-name-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');
		let hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			emailField,
			passwordField,
			passwordConfirmationField,
			nameField
		]);

		if (!hasErrors) {
			if (emailField.val().indexOf('@') === -1) {
				addErrorToField(emailField, INVALID_EMAIL);
				hasErrors = true;
			}

			if (passwordField.val().length < 6) {
				addErrorToField(passwordField, PASSWORD_TOO_SHORT);
				hasErrors = true;
			}

			if (passwordConfirmationField.val() != passwordField.val()) {
				addErrorToField(passwordConfirmationField, CONFIRMATION_MUST_MATCH_PASSWORD);
				hasErrors = true;
			}

			if (nameField.val().length > 20) {
				addErrorToField(nameField, USERNAME_TOO_LONG);
				hasErrors = true;
			}

			if (!hasErrors) {
				disableButton(e, true);
				Accounts.createUser(
					{email: emailField.val(), password: passwordField.val(), profile: {name: nameField.val()}},
					function(error) {
						disableButton(e, false);
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
	}
});

Template.login.rendered = function() {
	this.find('#login-email-field').focus();
};
