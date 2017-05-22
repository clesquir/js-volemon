import {assert} from 'chai';
import {Random} from 'meteor/random';
import AchievementMonitor from '/imports/api/achievements/client/Monitor.js';

describe('Achievement Monitor', function() {
	const achievement = {
		levels: [
			{level: 1, number: 5},
			{level: 2, number: 10},
			{level: 3, number: 15},
		]
	};

	it('levelReached returns false if there is no achievement', function() {
		const monitor = new AchievementMonitor(Random.id(5));

		assert.isFalse(monitor.levelReached(undefined, 5, 0));
	});

	it('levelReached returns false if new number is below all levels', function() {
		const monitor = new AchievementMonitor(Random.id(5));

		assert.isFalse(monitor.levelReached(achievement, 0, 0));
		assert.isFalse(monitor.levelReached(achievement, 1, 0));
		assert.isFalse(monitor.levelReached(achievement, 2, 1));
		assert.isFalse(monitor.levelReached(achievement, 4, 0));
		assert.isFalse(monitor.levelReached(achievement, 4, 1));
	});

	it('levelReached returns level number when it is equal and has changed level', function() {
		const dataProvider = [
			{expectedLevel: 1, expectedNumber: 5, newNumber: 5, oldNumber: 0},
			{expectedLevel: 1, expectedNumber: 5, newNumber: 5, oldNumber: 2},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 10, oldNumber: 0},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 10, oldNumber: 2},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 10, oldNumber: 8},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 15, oldNumber: 0},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 15, oldNumber: 2},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 15, oldNumber: 8},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 15, oldNumber: 12},
		];

		const monitor = new AchievementMonitor(Random.id(5));
		for (let data of dataProvider) {
			let levelReached = monitor.levelReached(achievement, data.newNumber, data.oldNumber);
			assert.isNotFalse(levelReached);
			assert.strictEqual(data.expectedLevel, levelReached.level);
			assert.strictEqual(data.expectedNumber, levelReached.number);
		}
	});

	it('levelReached returns level number when it is greater and has changed level', function() {
		const dataProvider = [
			{expectedLevel: 1, expectedNumber: 5, newNumber: 6, oldNumber: 0},
			{expectedLevel: 1, expectedNumber: 5, newNumber: 6, oldNumber: 2},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 11, oldNumber: 0},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 11, oldNumber: 2},
			{expectedLevel: 2, expectedNumber: 10, newNumber: 11, oldNumber: 8},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 16, oldNumber: 0},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 16, oldNumber: 2},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 16, oldNumber: 8},
			{expectedLevel: 3, expectedNumber: 15, newNumber: 16, oldNumber: 12},
		];

		const monitor = new AchievementMonitor(Random.id(5));
		for (let data of dataProvider) {
			let levelReached = monitor.levelReached(achievement, data.newNumber, data.oldNumber);
			assert.isNotFalse(levelReached);
			assert.strictEqual(data.expectedLevel, levelReached.level);
			assert.strictEqual(data.expectedNumber, levelReached.number);
		}
	});

	it('levelReached returns false when level has not changed', function() {
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
			assert.isFalse(monitor.levelReached(achievement, data.newNumber, data.oldNumber));
		}
	});
});
