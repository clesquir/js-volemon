import Keymaps from '/imports/lib/keymaps/Keymaps.js';

export default class CustomKeymaps extends Keymaps {
	/**
	 * @param userKeymaps
	 * @returns {CustomKeymaps}
	 */
	static fromUserKeymaps(userKeymaps) {
		if (userKeymaps) {
			return new CustomKeymaps(
				userKeymaps.left,
				userKeymaps.right,
				userKeymaps.up,
				userKeymaps.down
			);
		}

		return CustomKeymaps.defaultKeymaps();
	}

	/**
	 * @returns {CustomKeymaps}
	 */
	static defaultKeymaps() {
		return new CustomKeymaps(
			[37],
			[39],
			[38],
			[32]
		);
	}
}
