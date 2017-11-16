import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import WeatherSkin from '/imports/api/skins/skins/WeatherSkin.js';
import {SKIN_WEATHER} from '/imports/api/skins/skinConstants.js';

export default class SkinFactory {
	/**
	 * @param id
	 * @returns {Skin}
	 */
	static fromId(id) {
		switch (id) {
			case SKIN_WEATHER:
				return new WeatherSkin();
		}

		return new DefaultSkin();
	}
}
