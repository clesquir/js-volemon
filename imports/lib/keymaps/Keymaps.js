export default class Keymaps {
	constructor(leftKeyCodes, rightKeyCodes, upKeyCodes, downKeyCodes) {
		this.mapping = {left: leftKeyCodes, right: rightKeyCodes, up: upKeyCodes, down: downKeyCodes};
	}

	map(mapping, keyCode) {
		this.mapping[mapping].push(keyCode);
	}

	monitors(keyCode) {
		return (this.mappingForKeyCode(keyCode) !== undefined);
	}

	mappingForKeyCode(keyCode) {
		for (let mapping in this.mapping) {
			if (this.mapping.hasOwnProperty(mapping)) {
				for (let mappedKeyCode of this.mapping[mapping]) {
					if (mappedKeyCode === keyCode) {
						return mapping;
					}
				}
			}
		}

		return undefined;
	}
}
