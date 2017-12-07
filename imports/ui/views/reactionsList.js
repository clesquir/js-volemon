import {Template} from 'meteor/templating';

import './reactionsList.html';

Template.reactionsList.helpers({
	reactions: function() {
		return [
			{
				index: 1,
				icon: 'wow'
			},
			{
				index: 2,
				icon: 'angry'
			},
			{
				index: 3,
				icon: 'sob'
			},
			{
				index: 4,
				icon: 'laugh'
			},
			{
				index: 5,
				text: 'Good game!'
			},
			{
				index: 6,
				text: 'What a shot!'
			},
			{
				index: 7,
				text: 'Lucky you!'
			},
			{
				index: 8,
				text: 'Calculated.'
			},
			{
				index: 9,
				text: 'Boring!'
			},
			{
				index: 0,
				text: 'Oops!'
			}
		];
	}
});
