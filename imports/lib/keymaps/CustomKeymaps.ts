import Keymaps from './Keymaps';

export default class CustomKeymaps extends Keymaps {
	static fromUserKeymaps(userKeymaps: {left: number, right: number, up: number, down: number}): CustomKeymaps {
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

	static defaultKeymaps(): CustomKeymaps {
		return new CustomKeymaps(
			37,
			39,
			38,
			32
		);
	}
}
