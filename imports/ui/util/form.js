actionAfterLoginCreateUser = null;
actionOnLighboxClose = null;

disableButton = function(e, disabled) {
	const button = $(e.target).find('.button');
	button.prop('disabled', disabled);
};

removeFieldInvalidMark = function(field) {
	field.parent().children('.inline-form-error').remove();
	field.removeClass('field-in-error');
};

removeErrorLabelContainer = function(errorLabelContainer) {
	errorLabelContainer.hide();
	errorLabelContainer.html();
};

removeFieldsInvalidMarkAndSwitchForm = function(formToShow, formToHide) {
	const fieldsInError = $(formToShow).find('input.field-in-error');
	const errorLabelContainer = $(formToShow).find('.error-label-container');

	fieldsInError.each(function(index, field) {
		removeFieldInvalidMark($(field));
	});

	$(formToHide).hide();
	removeErrorLabelContainer(errorLabelContainer);
	$(formToShow).show();

	$(formToShow).find('input[name=email]').focus();
};

validateFieldsPresenceAndMarkInvalid = function(form, fields) {
	let hasRequiredErrors = false;

	for (let field of fields) {
		let value = field.val();

		removeFieldInvalidMark(field);

		if (value === '') {
			addErrorToField(field, "Can't be empty.");
			hasRequiredErrors = true;
		}
	}

	return hasRequiredErrors;
};

addErrorToField = function(field, errorMessage) {
	$('<div class="inline-form-error">' + errorMessage + '</div>').insertBefore(field);
	field.addClass('field-in-error');
};