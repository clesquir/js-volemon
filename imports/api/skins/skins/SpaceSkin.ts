import Skin from './Skin';

export default class SpaceSkin implements Skin {
	init() {
	}

	key(): string {
		return 'space-skin';
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: this.key(),
				imagePath: '/assets/skin/space/texture-atlas.png',
				jsonPath: '/assets/skin/space/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/space/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#000000';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: this.key(),
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3'],
				speed: 10
			}
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'net'
		};
	}

	soccerNetComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'soccer-net'
		};
	}

	soccerPostComponent(): { key: string; frame: string } {
		return {
			key: this.key(),
			frame: 'soccer-post'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: this.key(),
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: this.key(),
			hostFrames: ['explosion-1', 'explosion-2'],
			clientFrames: ['explosion-1', 'explosion-2']
		};
	}
}
