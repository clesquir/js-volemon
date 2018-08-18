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

		if (!isTournamentEditor() && !isTournamentAdministrator()) {
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
		endDate,
		numberOfLostAllowed,
		mode
	) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (!isTournamentAdministrator() && (!isTournamentEditor() || tournament.editor.id !== userId)) {
			throw new Meteor.Error('not-allowed', 'You can only update tournaments you have created');
		}

		if (tournament.status.id !== 'draft') {
			throw new Meteor.Error('not-allowed', 'The tournament has to be draft');
		}

		Tournaments.update(
			{_id: id},
			{$set:
				{
					name: name,
					description: description,
					gameMode: gameMode,
					startDate: startDate + ' -04:00',
					endDate: endDate + ' -04:00',
					numberOfLostAllowed: numberOfLostAllowed,
					mode: mode
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

	submitTournament: function(id) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (!isTournamentAdministrator() && (!isTournamentEditor() || tournament.editor.id !== userId)) {
			throw new Meteor.Error('not-allowed', 'You can only submit tournaments you have created');
		}

		if (tournament.status.id !== 'draft') {
			throw new Meteor.Error('not-allowed', 'The tournament has to be draft');
		}

		Tournaments.update(
			{_id: id},
			{$set:
				{
					status: {id: 'submitted', name: 'Submitted'}
				}
			}
		);
	},

	draftTournament: function(id) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (!isTournamentAdministrator() && (!isTournamentEditor() || tournament.editor.id !== userId)) {
			throw new Meteor.Error('not-allowed', 'You can only return to draft tournaments you have created');
		}

		if (tournament.status.id !== 'submitted') {
			throw new Meteor.Error('not-allowed', 'The tournament has to be submitted');
		}

		Tournaments.update(
			{_id: id},
			{$set:
				{
					status: {id: 'draft', name: 'Draft'}
				}
			}
		);
	},

	approveTournament: function(id) {
		const userId = Meteor.userId();

		if (!userId) {
			throw new Meteor.Error(401, 'You need to login to update a tournament');
		}

		if (!isTournamentAdministrator()) {
			throw new Meteor.Error('not-allowed', 'You cannot approve a tournament');
		}

		const tournament = Tournaments.findOne({_id: id});

		if (!tournament) {
			throw new Meteor.Error(404, 'The tournament does not exist');
		}

		if (tournament.status.id !== 'submitted') {
			throw new Meteor.Error('not-allowed', 'The tournament has to be submitted');
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
