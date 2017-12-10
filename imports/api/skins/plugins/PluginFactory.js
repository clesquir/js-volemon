import WeatherPlugin from '/imports/api/skins/plugins/WeatherPlugin.js';

export default class PluginFactory {
	/**
	 * @param configuration
	 * @returns {Plugin[]}
	 */
	static fromConfiguration(configuration) {
		const plugins = [];

		if (configuration) {
			if (configuration.pluginWeatherAdaptiveEnabled) {
				plugins.push(new WeatherPlugin());
			}
		}

		return plugins;
	}
}
