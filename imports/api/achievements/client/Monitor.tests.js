import {chai} from 'meteor/practicalmeteor:chai';
import {Random} from 'meteor/random';
import AchievementMonitor from '/imports/api/achievements/client/Monitor.js';

describe('Achievement Monitor', function() {
	const achievement = {
		levels: [
			{number: 5},
			{number: 10},
			{number: 15},
		]
	};

	it('levelNumberReached returns false if there is no achievement', function() {
		const monitor = new AchievementMonitor(Random.id(5));

		chai.assert.isFalse(monitor.levelNumberReached(undefined, 5, 0));
	});

	it('levelNumberReached returns false if new number is below all levels', function() {
		const monitor = new AchievementMonitor(Random.id(5));

		chai.assert.isFalse(monitor.levelNumberReached(achievement, 0, 0));
		chai.assert.isFalse(monitor.levelNumberReached(achievement, 1, 0));
		chai.assert.isFalse(monitor.levelNumberReached(achievement, 2, 1));
		chai.assert.isFalse(monitor.levelNumberReached(achievement, 4, 0));
		chai.assert.isFalse(monitor.levelNumberReached(achievement, 4, 1));
	});

	it('levelNumberReached returns level number when it is equal and has changed level', function() {
		const dataProvider = [
			{expected: 5, newNumber: 5, oldNumber: 0},
			{expected: 5, newNumber: 5, oldNumber: 2},
			{expected: 10, newNumber: 10, oldNumber: 0},
			{expected: 10, newNumber: 10, oldNumber: 2},
			{expected: 10, newNumber: 10, oldNumber: 8},
			{expected: 15, newNumber: 15, oldNumber: 0},
			{expected: 15, newNumber: 15, oldNumber: 2},
			{expected: 15, newNumber: 15, oldNumber: 8},
			{expected: 15, newNumber: 15, oldNumber: 12},
		];

		const monitor = new AchievementMonitor(Random.id(5));
		for (let data of dataProvider) {
			chai.assert.strictEqual(
				data.expected,
				monitor.levelNumberReached(achievement, data.newNumber, data.oldNumber)
			);
		}
	});

	it('levelNumberReached returns level number when it is greater and has changed level', function() {
		const dataProvider = [
			{expected: 5, newNumber: 6, oldNumber: 0},
			{expected: 5, newNumber: 6, oldNumber: 2},
			{expected: 10, newNumber: 11, oldNumber: 0},
			{expected: 10, newNumber: 11, oldNumber: 2},
			{expected: 10, newNumber: 11, oldNumber: 8},
			{expected: 15, newNumber: 16, oldNumber: 0},
			{expected: 15, newNumber: 16, oldNumber: 2},
			{expected: 15, newNumber: 16, oldNumber: 8},
			{expected: 15, newNumber: 16, oldNumber: 12},
		];

		const monitor = new AchievementMonitor(Random.id(5));
		for (let data of dataProvider) {
			chai.assert.strictEqual(
				data.expected,
				monitor.levelNumberReached(achievement, data.newNumber, data.oldNumber)
			);
		}
	});

	it('levelNumberReached returns false when level has not changed', function() {
		const dataProvider = [
			{newNumber: 5, oldNumber: 5},
			{newNumber: 6, oldNumber: 5},
			{newNumber: 6, oldNumber: 6},
			{newNumber: 7, oldNumber: 6},
			{newNumber: 10, oldNumber: 10},
			{newNumber: 11, oldNumber: 10},
			{newNumber: 11, oldNumber: 11},
			{newNumber: 12, oldNumber: 11},
			{newNumber: 15, oldNumber: 15},
			{newNumber: 16, oldNumber: 15},
			{newNumber: 16, oldNumber: 16},
			{newNumber: 17, oldNumber: 16},
		];

		const monitor = new AchievementMonitor(Random.id(5));
		for (let data of dataProvider) {
			chai.assert.isFalse(monitor.levelNumberReached(achievement, data.newNumber, data.oldNumber));
		}
	});
});
