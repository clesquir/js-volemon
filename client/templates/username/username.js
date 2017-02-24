Template.username.helpers({
	value: function() {
		var user = Meteor.user();

		return user ? user.profile.name : null;
	}
});

Template.username.events({
	'submit form[name=username]': function(e) {
		e.preventDefault();

		var user = Meteor.user(),
			usernameField = $(e.target).find('#username-name-field'),
			usernameFieldValue = usernameField.val(),
			errorLabelContainer = $(e.target).find('.error-label-container'),
			tooLongUsernameErrorMessage = 'Username must be at maximum 20 characters long',
			hasErrors;

		removeErrorLabelContainer(errorLabelContainer);

		hasErrors = validateFieldsPresenceAndMarkInvalid($(e.target), [
			usernameField
		]);

		if (!hasErrors && usernameFieldValue.length > 20) {
			usernameField.addClass('field-in-error');
			usernameField.prop('title', tooLongUsernameErrorMessage);
			errorLabelContainer.show();
			errorLabelContainer.html(tooLongUsernameErrorMessage);
			hasErrors = true;
		}

		if (user && !hasErrors) {
			let button = $(e.target).find('.button');
			button.prop('disabled', true);

			Meteor.call('updateUserName', usernameFieldValue, function(error) {
				button.prop('disabled', false);
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

Template.username.rendered = function() {
	this.find('[name=name]').focus();
};
