export default class Keymaps {
	mapping: {left: number, right: number, up: number, down: number};

	constructor(leftKeyCode, rightKeyCode, upKeyCode, downKeyCode) {
		this.mapping = {left: leftKeyCode, right: rightKeyCode, up: upKeyCode, down: downKeyCode};
	}

	map(mapping: string, keyCode: number) {
		this.mapping[mapping] = keyCode;
	}

	monitors(keyCode: number): boolean {
		return (this.mappingForKeyCode(keyCode) !== null);
	}

	mappingForKeyCode(keyCode: number): string | null {
		for (let mapping in this.mapping) {
			if (this.mapping.hasOwnProperty(mapping) && this.mapping[mapping] === keyCode) {
				return mapping;
			}
		}

		return null;
	}
}
