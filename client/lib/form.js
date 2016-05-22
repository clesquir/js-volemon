actionAfterLoginCreateUser = null;
actionOnLighboxClose = null;

removeFieldInvalidMark = function(field) {
	field.removeClass('field-in-error');
	field.prop('title', '');
};

removeErrorLabelContainer = function(errorLabelContainer) {
	errorLabelContainer.hide();
	errorLabelContainer.html();
};

validateFieldsPresenceAndMarkInvalid = function(form, fields) {
	var errorLabelContainer = form.find('.error-label-container'),
		fieldRequiredErrorMessage = 'The field is required',
		hasRequiredErrors = false;

	for (let field of fields) {
		let value = field.val();

		removeFieldInvalidMark(field);

		if (value === '') {
			field.addClass('field-in-error');
			field.prop('title', fieldRequiredErrorMessage);
			hasRequiredErrors = true;
		}
	}

	if (hasRequiredErrors) {
		errorLabelContainer.show();
		errorLabelContainer.html(fieldRequiredErrorMessage);
	}

	return hasRequiredErrors;
};
