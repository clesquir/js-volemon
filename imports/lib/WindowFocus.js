let isFocused = true;
let listeners = [];

export default class WindowFocus {
	static start() {
		isFocused = true;

		window.addEventListener('focus', function() {
			isFocused = true;

			const remainingListeners = [];
			for (let listener of listeners) {
				listener.callback.call();
				if (!listener.once) {
					remainingListeners.push(listener);
				}
			}

			listeners = remainingListeners;
		});
		window.addEventListener('blur', function() {
			isFocused = false;
		});
	}

	static isFocused() {
		return isFocused;
	}

	static addListenerOnFocus(callback, once) {
		listeners.push({callback: callback, once: once});
	}
}
