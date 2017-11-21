import {assert} from 'chai';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';

describe('PhaserEngine#constrainVelocity', function() {
	it('restricts velocity without changing the angle if 0 degrees', function() {
		var engine = new PhaserEngine(new StaticGameConfiguration()),
			sprite = {
				body: {
					velocity: {
						x: 0,
						y: 1000
					}
				}
			};

		engine.constrainVelocity(sprite, 500);

		assert.equal(0, Math.round(sprite.body.velocity.x));
		assert.equal(500, Math.round(sprite.body.velocity.y));
	});

	it('restricts velocity without changing the angle if 45 degrees', function() {
		var engine = new PhaserEngine(new StaticGameConfiguration()),
			sprite = {
				body: {
					velocity: {
						x: 1000,
						y: 1000
					}
				}
			};

		engine.constrainVelocity(sprite, 500);

		assert.equal(354, Math.round(sprite.body.velocity.x));
		assert.equal(354, Math.round(sprite.body.velocity.y));
	});

	it('restricts velocity without changing the angle if 90 degrees', function() {
		var engine = new PhaserEngine(new StaticGameConfiguration()),
			sprite = {
				body: {
					velocity: {
						x: 1000,
						y: 0
					}
				}
			};

		engine.constrainVelocity(sprite, 500);

		assert.equal(500, Math.round(sprite.body.velocity.x));
		assert.equal(0, Math.round(sprite.body.velocity.y));
	});
});
