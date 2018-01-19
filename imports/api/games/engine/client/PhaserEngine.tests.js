import {assert} from 'chai';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';

describe('PhaserEngine#constrainVelocity', function() {
	it('restricts velocity without changing the angle if 0 degrees', function() {
		const engine = new PhaserEngine();
		const sprite = {
			body: {
				velocity: {
					x: 0,
					y: 1000
				}
			}
		};

		engine.constrainVelocity(sprite, 500);

		assert.equal(0, Math.round(engine.getHorizontalSpeed(sprite)));
		assert.equal(500, Math.round(engine.getVerticalSpeed(sprite)));
	});

	it('restricts velocity without changing the angle if 45 degrees', function() {
		const engine = new PhaserEngine();
		const sprite = {
			body: {
				velocity: {
					x: 1000,
					y: 1000
				}
			}
		};

		engine.constrainVelocity(sprite, 500);

		assert.equal(354, Math.round(engine.getHorizontalSpeed(sprite)));
		assert.equal(354, Math.round(engine.getVerticalSpeed(sprite)));
	});

	it('restricts velocity without changing the angle if 90 degrees', function() {
		const engine = new PhaserEngine();
		const sprite = {
			body: {
				velocity: {
					x: 1000,
					y: 0
				}
			}
		};

		engine.constrainVelocity(sprite, 500);

		assert.equal(500, Math.round(engine.getHorizontalSpeed(sprite)));
		assert.equal(0, Math.round(engine.getVerticalSpeed(sprite)));
	});
});
