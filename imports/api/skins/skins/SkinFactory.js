import {
	SKIN_DEVALTO,
	SKIN_HALLOWEEN,
	SKIN_INDUSTRIAL,
	SKIN_JUJU_WORLD,
	SKIN_MARIO_BROS,
	SKIN_SPACE,
	SKIN_XMAS
} from '/imports/api/skins/skinConstants.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import DevaltoSkin from '/imports/api/skins/skins/DevaltoSkin.js';
import HalloweenSkin from '/imports/api/skins/skins/HalloweenSkin.js';
import IndustrialSkin from '/imports/api/skins/skins/IndustrialSkin.js';
import JujuWorldSkin from '/imports/api/skins/skins/JujuWorldSkin.js';
import MarioBrosSkin from '/imports/api/skins/skins/MarioBrosSkin.js';
import SpaceSkin from '/imports/api/skins/skins/SpaceSkin.js';
import XmasSkin from '/imports/api/skins/skins/XmasSkin.js';

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
			case SKIN_HALLOWEEN:
				return new HalloweenSkin();
			case SKIN_XMAS:
				return new XmasSkin();
		}

		return new DefaultSkin();
	}
}
