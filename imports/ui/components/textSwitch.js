import './textSwitch.html';

Template.textSwitch.onRendered(function() {
	const checkbox = $(`#check-${this.data.id}`);
	const field = $(`#${this.data.id}`);

	if (this.data.isOn) {
		checkbox.prop('checked', true);
	} else {
		field.prop('disabled', true);
	}

	if (this.data.isReadOnly) {
		field.prop('disabled', true);
	}
});

Template.textSwitch.helpers({
	fieldIsReadOnly: function(isOn, isReadOnly) {
		if (isReadOnly) {
			return true;
		}

		return !isOn;
	}
});

Template.textSwitch.events({
	'click [data-checkbox-action=enable-text-switch]': function(e) {
		if (this.isReadOnly) {
			return;
		}

		const checkbox = $(e.currentTarget);
		const field = $(`#${this.id}`);

		if (checkbox.is(':checked')) {
			field.prop('disabled', false);
		} else {
			field.prop('disabled', true);
			field.val('');
		}
	}
});
