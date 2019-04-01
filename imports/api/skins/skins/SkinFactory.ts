import {
	SKIN_DEVALTO,
	SKIN_HALLOWEEN,
	SKIN_INDUSTRIAL,
	SKIN_JUJU_WORLD,
	SKIN_MARIO_BROS,
	SKIN_SPACE,
	SKIN_XMAS
} from '../skinConstants';
import DefaultSkin from './DefaultSkin';
import DevaltoSkin from './DevaltoSkin';
import HalloweenSkin from './HalloweenSkin';
import IndustrialSkin from './IndustrialSkin';
import JujuWorldSkin from './JujuWorldSkin';
import MarioBrosSkin from './MarioBrosSkin';
import SpaceSkin from './SpaceSkin';
import XmasSkin from './XmasSkin';
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
