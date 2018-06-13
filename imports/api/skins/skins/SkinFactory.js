import {
	SKIN_DEVALTO,
	SKIN_INDUSTRIAL,
	SKIN_JUJU_WORLD,
	SKIN_MARIO_BROS,
	SKIN_SPACE
} from '/imports/api/skins/skinConstants.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import DevaltoSkin from '/imports/api/skins/skins/DevaltoSkin.js';
import IndustrialSkin from '/imports/api/skins/skins/IndustrialSkin.js';
import JujuWorldSkin from '/imports/api/skins/skins/JujuWorldSkin.js';
import MarioBrosSkin from '/imports/api/skins/skins/MarioBrosSkin.js';
import SpaceSkin from '/imports/api/skins/skins/SpaceSkin.js';

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
			case SKIN_INDUSTRIAL:
				return new IndustrialSkin();
			case SKIN_SPACE:
				return new SpaceSkin();
		}

		return new DefaultSkin();
	}
}
