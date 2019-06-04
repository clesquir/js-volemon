export declare type KeyMapping = {
	left: number | null;
	right: number | null;
	up: number | null;
	down: number | null;
	displayPlayerNames: number | null;
};

export default class Keymaps {
	mapping: KeyMapping;

	constructor(
		leftKeyCode: number,
		rightKeyCode: number,
		upKeyCode: number,
		downKeyCode: number,
		displayPlayerNames: number
	) {
		this.mapping = {
			left: leftKeyCode,
			right: rightKeyCode,
			up: upKeyCode,
			down: downKeyCode,
			displayPlayerNames: displayPlayerNames
		};
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
