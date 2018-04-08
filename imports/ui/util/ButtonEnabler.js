export default class ButtonEnabler {
	static disableButton(target) {
		const button = $(target).find('.button');
		button.prop('disabled', true);
	}

	static enableButton(target) {
		const button = $(target).find('.button');
		button.prop('disabled', false);
	}
}
