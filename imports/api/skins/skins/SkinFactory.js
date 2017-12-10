import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import DevaltoSkin from '/imports/api/skins/skins/DevaltoSkin.js';
import {SKIN_DEVALTO} from '/imports/api/skins/skinConstants.js';

export default class SkinFactory {
	/**
	 * @param id
	 * @returns {Skin}
	 */
	static fromId(id) {
		switch (id) {
			case SKIN_DEVALTO:
				return new DevaltoSkin();
		}

		return new DefaultSkin();
	}
}
