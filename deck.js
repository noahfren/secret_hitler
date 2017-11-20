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

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = {
	LIBERAL: LIBERAL,
	FASCIST: FASCIST,
	NUM_LIBERAL_CARDS: NUM_LIBERAL_CARDS,
	NUM_FASCIST_CARDS: NUM_FASCIST_CARDS,
	Deck: function() {
		this.draw = [];
		this.discard = [];

		this.shuffle = function() {
			this.draw = shuffle(this.draw);
		}

		this.refresh = function() {
			while (this.discard.length > 0) {
				this.draw.append(this.discard.pop());
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
			while (unused.length > 0) {
				this.discard.push(unused.pop());
			}
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