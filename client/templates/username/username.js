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
			Meteor.call('updateUserName', usernameFieldValue);
			Session.set('lightbox', null);
		}
	}
});

Template.username.rendered = function() {
	this.find('[name=name]').focus();
};
