import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import DevaltoSkin from '/imports/api/skins/skins/DevaltoSkin.js';
import MarioBrosSkin from '/imports/api/skins/skins/MarioBrosSkin.js';
import JujuWorldSkin from '/imports/api/skins/skins/JujuWorldSkin.js';
import {SKIN_DEVALTO, SKIN_MARIO_BROS, SKIN_JUJU_WORLD} from '/imports/api/skins/skinConstants.js';

export default class SkinFactory {
	/**
	 * @param id
	 * @returns {Skin}
	 */
	static fromId(id) {
		switch (id) {
			case SKIN_DEVALTO:
				return new DevaltoSkin();
			case SKIN_MARIO_BROS:
				return new MarioBrosSkin();
			case SKIN_JUJU_WORLD:
				return new JujuWorldSkin();
		}

		return new DefaultSkin();
	}
}
