import Skin from './Skin';

export default class MarioBrosSkin implements Skin {
	init() {
	}

	key(): string {
		return 'mario-bros-skin';
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: this.key(),
				imagePath: '/assets/skin/mario-bros/texture-atlas.png',
				jsonPath: '/assets/skin/mario-bros/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		return [];
	}

	backgroundColor(): string {
		return '#6b8cff';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{
				key: this.key(),
				frame: 'background-mountain',
				x: 145,
				y: ySize - 158,
				width: 200,
				height: 88
			},
			{
				key: this.key(),
				frame: 'background-bush',
				x: xSize - 350,
				y: ySize - 110,
				width: 120,
				height: 40
			},
			{
				key: this.key(),
				frame: 'background-cloud',
				x: xSize - 290,
				y: 86,
				width: 160,
				height: 60
			}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: this.key(),
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3', 'ball-4'],
				speed: 5
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
			hostFrames: ['confettis-goomba-light'],
			clientFrames: ['confettis-goomba-dark']
		};
	}
}
