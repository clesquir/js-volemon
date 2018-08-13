import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {
	isTournamentAdministrator,
	isTournamentEditor,
	UserConfigurations
} from '/imports/api/users/userConfigurations.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.methods({
	createTournament: function() {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to create a tournament');
		}

		if (!isTournamentEditor && !isTournamentAdministrator()) {
			throw new Meteor.Error('not-allowed', 'You cannot create a tournament');
		}

		const userConfiguration = UserConfigurations.findOne({userId: userId});
		const id = Random.id(5);

		Tournaments.insert(
			{
				_id: id,
				gameMode: ONE_VS_ONE_GAME_MODE,
				status: {id: 'draft', name: 'Draft'},
				editor: {id: userId, name: userConfiguration.name},
				mode: {},
				isPublished: false
			}
		);

		return id;
	},

	updateTournament: function(
		id,
		name,
		description,
		gameMode,
		startDate,
		endDate
	) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (!isTournamentEditor && !isTournamentAdministrator()) {
			throw new Meteor.Error('not-allowed', 'Only editors can create tournaments');
		}

		if (!isTournamentAdministrator() && (!isTournamentEditor() || tournament.editor.id !== userId)) {
			throw new Meteor.Error('not-allowed', 'You can only update tournaments you have created');
		}

		Tournaments.update(
			{_id: id},
			{$set:
				{
					name: name,
					description: description,
					gameMode: gameMode,
					startDate: startDate + ' -04:00',
					endDate: endDate + ' -04:00'
				}
			}
		);
	},

	removeTournament: function(id) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (!isTournamentAdministrator() && (!isTournamentEditor() || tournament.editor.id !== userId)) {
			throw new Meteor.Error('not-allowed', 'You can only remove tournaments you have created');
		}

		Tournaments.remove({_id: id});
	},

	approveDraftTournament: function(id) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		if (!isTournamentAdministrator()) {
			throw new Meteor.Error('not-allowed', 'You cannot approve a draft tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		Tournaments.update(
			{_id: id},
			{$set:
				{
					status: {id: 'approved', name: 'Approved'}
				}
			}
		);
	}
});
