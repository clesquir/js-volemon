import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Session} from 'meteor/session';
import {PLAYER_ALLOWED_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';
import {elementInRelatedView} from '/imports/lib/utils.js';
import {OPEN_SELECT_BOXES} from '/imports/ui/pages/app.js';

import './shapeSelector.html';

const createShapeDropdownList = function(e) {
	const listId = 'shape-selector-menu';
	const dropdownList = $('<div>', {id: listId, 'class': listId + ' menubox-animation'});
	dropdownList.appendTo('.app');
	let selectedShapeListItem;

	Meteor.setTimeout(() => {
		if (dropdownList) {
			dropdownList.removeClass('menubox-animation');
			//Scroll item in view
			Meteor.setTimeout(() => {
				if (selectedShapeListItem && !(elementInRelatedView(selectedShapeListItem, dropdownList))) {
					dropdownList.animate({scrollTop: selectedShapeListItem.position().top}, 250);
				}
			}, 250);
		}
	}, 0);

	const shapeSelector = $(e.target).closest('.shape-selector');
	dropdownList.css('top', shapeSelector.offset().top);
	dropdownList.css('left', shapeSelector.offset().left);

	//on window resize, repositionized the shapeSelector
	$(window).resize(function() {
		dropdownList.css('top', shapeSelector.offset().top);
		dropdownList.css('left', shapeSelector.offset().left);
	});

	for (let shape of PLAYER_ALLOWED_LIST_OF_SHAPES) {
		let isSelectedShape = false;
		if (shapeSelector.attr('data-selected-shape') === shape) {
			isSelectedShape = true;
		}

		const listItem = $(
			'<div class="shape-selector-item ' + (isSelectedShape ? 'selected-shape' : '') + '">' +
				'<div class="shape-selector-container shape-' + shape + '" data-shape="' + shape + '">' +
					'<div class="shape-content-scroller"></div>' +
				'</div>' +
			'</div>'
		);
		listItem.click(function(e) {
			const parent = $(e.target).closest('.shape-selector-container');
			const child = $(e.target).find('.shape-selector-container');

			let selectedShape = child.attr('data-shape');
			if (parent.length) {
				selectedShape = parent.attr('data-shape');
			}
			Meteor.call('updatePlayerShape', Session.get('game'), selectedShape);
		});
		listItem.appendTo(dropdownList);

		if (isSelectedShape) {
			selectedShapeListItem = listItem;
		}
	}

	return dropdownList;
};

Template.shapeSelector.events({
	'click [data-action="open-shape-selector"]': function(e) {
		const listId = 'shape-selector-menu';

		let dropdownList = document.getElementById(listId);
		if (!dropdownList) {
			dropdownList = createShapeDropdownList(e);
		}

		if ($(dropdownList).is(":visible")) {
			$(dropdownList).remove();
			delete OPEN_SELECT_BOXES[listId];
		} else {
			OPEN_SELECT_BOXES[listId] = {
				triggerClass: '.shape-selector',
				listId: listId,
				hideCallback: function(list) {
					list.addClass('menubox-animation');
					Meteor.setTimeout(() => {
						if (list) {
							list.remove();
						}
					}, 250);
				}
			};

			$(dropdownList).show();
		}
	}
});
