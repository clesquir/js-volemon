export default class ButtonEnabler {
	static disableButton(target) {
		let button = $(target).find('.button');

		if ($(target).is('.button')) {
			button = $(target);
		}

		button.prop('disabled', true);
	}

	static enableButton(target) {
		let button = $(target).find('.button');

		if ($(target).is('.button')) {
			button = $(target);
		}

		button.prop('disabled', false);
	}
}
