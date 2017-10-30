let isFocused = true;
let listeners = [];

export default class WindowFocus {
	static init() {
		isFocused = true;
		window.onfocus = () => {
			isFocused = true;

			const remainingListeners = [];
			for (let listener of listeners) {
				listener.callback.call();
				if (!listener.once) {
					remainingListeners.push(listener);
				}
			}

			listeners = remainingListeners;
		};
		window.onblur = () => {
			isFocused = false;
		};
	}

	static isFocused() {
		return isFocused;
	}

	static addListenerOnFocus(callback, once) {
		listeners.push({callback: callback, once: once});
	}
}
