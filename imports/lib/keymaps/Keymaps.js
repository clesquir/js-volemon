export default class Keymaps {
	constructor(leftKeyCode, rightKeyCode, upKeyCode, downKeyCode) {
		this.mapping = {left: leftKeyCode, right: rightKeyCode, up: upKeyCode, down: downKeyCode};
	}

	map(mapping, keyCode) {
		this.mapping[mapping] = keyCode;
	}

	monitors(keyCode) {
		return (this.mappingForKeyCode(keyCode) !== null);
	}

	mappingForKeyCode(keyCode) {
		for (let mapping in this.mapping) {
			if (this.mapping.hasOwnProperty(mapping) && this.mapping[mapping] === keyCode) {
				return mapping;
			}
		}

		return null;
	}
}
