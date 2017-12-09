// Deck
	// Deque of 17 policy cards (represented as booleans)
		// 6 of 17 are Liberal Cards (bool == true)
		// 11 of 17 are Fascist Cards (bool == false)

	// Discard pile
		// collects unused cards
		// when deck is empty, contentes are shuffeled and placed in deck
const LIBERAL = 'LIBERAL';
const FASCIST = 'FASCIST';
const NUM_LIBERAL_CARDS = 6;
const NUM_FASCIST_CARDS = 11;

var utils = require('../utils.js');

module.exports = {
	LIBERAL: LIBERAL,
	FASCIST: FASCIST,
	NUM_LIBERAL_CARDS: NUM_LIBERAL_CARDS,
	NUM_FASCIST_CARDS: NUM_FASCIST_CARDS,
	Deck: function() {
		this.draw = [];
		this.discard = [];

		this.shuffle = function() {
			this.draw = utils.shuffle(this.draw);
		}

		this.refresh = function() {
			while (this.discard.length > 0) {
				this.draw.push(this.discard.pop());
			}
			this.shuffle();
		}

		this.getHand = function() {
			if (this.draw.length < 3) {
				this.refresh();
			}
			arr = [];
			for (var i = 0; i < 3; i++) {
				arr.push(this.draw.pop());
			}
			return arr;
		}

		this.discardUnused = function(unused) {
			this.discard.push(unused);
		}

		this.policyPeek = function() {
			var temp = [];
			if (this.draw.length < 3) {
				this.refresh();
			}
			temp.push(this.draw[this.draw.length - 3]);
			temp.push(this.draw[this.draw.length - 2]);
			temp.push(this.draw[this.draw.length - 1]);
			return temp.slice();
		}

		for (var i = 0; i < NUM_LIBERAL_CARDS; i++) {
			this.draw.push(LIBERAL);
		}
		for (var i = 0; i < NUM_FASCIST_CARDS; i++) {
			this.draw.push(FASCIST);
		}
		this.shuffle();

	}
};