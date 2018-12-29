import {
	SKIN_DEVALTO,
	SKIN_HALLOWEEN,
	SKIN_INDUSTRIAL,
	SKIN_JUJU_WORLD,
	SKIN_MARIO_BROS,
	SKIN_SPACE,
	SKIN_XMAS
} from 'imports/api/skins/skinConstants.js';
import DefaultSkin from './DefaultSkin.js';
import DevaltoSkin from './DevaltoSkin.js';
import HalloweenSkin from './HalloweenSkin.js';
import IndustrialSkin from './IndustrialSkin.js';
import JujuWorldSkin from './JujuWorldSkin.js';
import MarioBrosSkin from './MarioBrosSkin.js';
import SpaceSkin from './SpaceSkin.js';
import XmasSkin from './XmasSkin.js';
import Skin from "./Skin";

export default class SkinFactory {
	static fromId(id: string): Skin {
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
