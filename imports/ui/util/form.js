import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';

export const disableButton = function(e, disabled) {
	if (disabled) {
		ButtonEnabler.disableButton(e.target);
	} else {
		ButtonEnabler.enableButton(e.target);
	}
};

export const removeFieldInvalidMark = function(field) {
	field.parent().children('.inline-form-error').remove();
	field.removeClass('field-in-error');
};

export const removeErrorLabelContainer = function(errorLabelContainer) {
	errorLabelContainer.html('');
};

/**
 * @param formToShow
 * @param {Array} formsToHide
 */
export const removeFieldsInvalidMarkAndSwitchForm = function(formToShow, formsToHide) {
	const fieldsInError = $(formToShow).find('input.field-in-error');
	const errorLabelContainer = $(formToShow).find('.error-label-container');

	fieldsInError.each(function(index, field) {
		removeFieldInvalidMark($(field));
	});

	for (let formToHide of formsToHide) {
		$(formToHide).hide();
	}

	removeErrorLabelContainer(errorLabelContainer);
	$(formToShow).show();

	$(formToShow).find('input[name=email]').focus();
};

export const validateFieldsPresenceAndMarkInvalid = function(form, fields) {
	let hasRequiredErrors = false;

	for (let field of fields) {
		let value = field.val();

		removeFieldInvalidMark(field);

		if (value.trim() === '') {
			addErrorToField(field, "Can't be empty.");
			hasRequiredErrors = true;
		}
	}

	return hasRequiredErrors;
};

export const addErrorToField = function(field, errorMessage) {
	$('<div class="inline-form-error">' + errorMessage + '</div>').insertBefore(field);
	field.addClass('field-in-error');
};
