// Game
	// id (string)
		// unique game id, given to players to join game with

	// players(array of players)
		// player id == index of player in array

	// policyDeck (Deck)
		// deck object containing this games policy cards

	// liberalPoliciesPlayed (int)
		// count of liberal policy cards played

	// fascistPoliciesPlayed (int)
		// count of fascist policy cards played

	// electionFailureCount (int)
		// count of number of elections failed in a row

	// president (*Player)
		// pointer to player that is currently president

	// chancellor (*Player)
		// pointer to player tha is currently chancellor
		// nil if no current chancellor elected

	// round (int)
		// Counts number of rounds

	// phase (int)
		// New Game == 0
		// Election == 1
		// Legislative Session == 2
		// Executive Action == 3
		// Game Over == 4

// Game Phase Constants
	const NEW_GAME = 0;
	const ELECTION = 1;
	const LEGISLATIVE_SESSION = 2;
	const EXECUTIVE_ACTION = 3;
	const GAME_OVER = 4;

	var deck = require('./deck.js');
	var player = require('./player.js');

module.exports = {
	NEW_GAME: NEW_GAME,
	ELECTION: ELECTION,
	LEGISLATIVE_SESSION: LEGISLATIVE_SESSION,
	EXECUTIVE_ACTION: EXECUTIVE_ACTION,
	GAME_OVER: GAME_OVER,

	// New Game Constructor
	Game: function (id_in) {
		this.id = id_in;
		this.players = [];
		this.phase = NEW_GAME;
		this.round = 0;
		this.deck = new deck.Deck();

		this.addPlayer = function (name_in, socket_in) {
			var nPlayers = this.players.length;
			for (var i = 0; i < nPlayers; i++) {
				if (this.players[i].name == name_in) {
					return false;
				}
			}
			this.players.push(new player.Player(nPlayers, name_in, socket_in, this));
			this.players[nPlayers].socket.join(this.id);
			return true;
		}

		this.addHost = function (name_in, socket_in) {
			this.addPlayer(name_in, socket_in);
			this.host = this.players[this.players.length - 1];
		}
	}
};