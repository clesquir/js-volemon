import Keymaps, {KeyMapping} from './Keymaps';

export default class CustomKeymaps extends Keymaps {
	private static readonly leftKey = 37;
	private static readonly rightKey = 39;
	private static readonly upKey = 38;
	private static readonly spaceKey = 32;
	private static readonly nKey = 'N'.charCodeAt(0);

	static fromUserKeymaps(userKeymaps: KeyMapping): CustomKeymaps {
		if (userKeymaps) {
			return new CustomKeymaps(
				userKeymaps.left || CustomKeymaps.leftKey,
				userKeymaps.right || CustomKeymaps.rightKey,
				userKeymaps.up || CustomKeymaps.upKey,
				userKeymaps.down || CustomKeymaps.spaceKey,
				userKeymaps.displayPlayerNames || CustomKeymaps.nKey
			);
		}

		return CustomKeymaps.defaultKeymaps();
	}

	static defaultKeymaps(): CustomKeymaps {
		return new CustomKeymaps(
			CustomKeymaps.leftKey,
			CustomKeymaps.rightKey,
			CustomKeymaps.upKey,
			CustomKeymaps.spaceKey,
			CustomKeymaps.nKey
		);
	}
}
