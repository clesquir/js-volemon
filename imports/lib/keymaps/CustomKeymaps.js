import Keymaps from '/imports/lib/keymaps/Keymaps.js';

export default class CustomKeymaps extends Keymaps {
	static fromUserKeymaps(userKeymaps) {
		if (userKeymaps) {
			return new CustomKeymaps(
				userKeymaps.leftKeyCodes,
				userKeymaps.rightKeyCodes,
				userKeymaps.upKeyCodes,
				userKeymaps.downKeyCodes
			);
		}

		return CustomKeymaps.defaultKeymaps();
	}

	static defaultKeymaps() {
		return new CustomKeymaps(
			[37, "A".charCodeAt(0)],
			[39, "D".charCodeAt(0)],
			[38, "W".charCodeAt(0)],
			[40, 32, "S".charCodeAt(0)]
		);
	}
}
