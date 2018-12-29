import Plugin from './Plugin';
import WeatherPlugin from './WeatherPlugin';

export default class PluginFactory {
	static fromConfiguration(configuration): Plugin[] {
		const plugins = [];

		if (configuration) {
			if (configuration.pluginWeatherAdaptiveEnabled) {
				plugins.push(new WeatherPlugin());
			}
		}

		return plugins;
	}
}
