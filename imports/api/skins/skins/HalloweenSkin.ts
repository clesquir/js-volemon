import Skin from './Skin';

export default class HalloweenSkin implements Skin {
	init() {
	}

	key(): string {
		return 'halloween-skin';
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: this.key(),
				imagePath: '/assets/skin/halloween/texture-atlas.png',
				jsonPath: '/assets/skin/halloween/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/halloween/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#000000';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{
				key: 'background',
				x: 0,
				y: 0,
				width: xSize,
				height: ySize
			},
			{
				key: this.key(),
				frame: 'tombs-1',
				x: 50,
				y: ySize - 165,
				width: 154,
				height: 122
			},
			{
				key: this.key(),
				frame: 'tombs-2',
				x: xSize - 225,
				y: ySize - 150,
				width: 163,
				height: 100
			}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: this.key(),
			frame: 'ball'
		};
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: this.key(),
			hostFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4', 'confettis-5'],
			clientFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4', 'confettis-5']
		};
	}
}
