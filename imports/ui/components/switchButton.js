import './switchButton.html';

switchTargetButton = function(e, value) {
	let switchButton = $(e.target);

	if (!switchButton.is('.switch-button')) {
		switchButton = $(e.target).find('.switch-button');
	}

	if (value) {
		switchButton.addClass('on-value');
		switchButton.removeClass('off-value');
	} else {
		switchButton.addClass('off-value');
		switchButton.removeClass('on-value');
	}
};
