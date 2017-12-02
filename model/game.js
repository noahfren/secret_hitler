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

// Game Phase Constants
const NEW_GAME = 0;
const NOMINATION = 1;
const ELECTION = 2;
const ELIMINATION = 3;
const LEGISLATIVE_ACTION = 4;
const GAME_OVER = 5;
const EXECUTION = 6;
const INVESTIGATION = 7;
const POLICY_PEEK = 8;

const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";

var deck = require('./deck.js');
var player = require('./player.js');
var utils = require('../utils.js');

module.exports = {
	NEW_GAME: NEW_GAME,
	NOMINATION: NOMINATION,
	ELECTION: ELECTION,
	ELIMINATION: ELIMINATION,
	LEGISLATIVE_ACTION: LEGISLATIVE_ACTION,
	GAME_OVER: GAME_OVER,
	EXECUTION: EXECUTION,
	INVESTIGATION: INVESTIGATION,
	POLICY_PEEK: POLICY_PEEK,

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
			this.players.push(new player.Player(nPlayers, name_in, socket_in));
			this.players[nPlayers].socket.join(this.id);
			return true;
		}

		this.addHost = function (name_in, socket_in) {
			this.addPlayer(name_in, socket_in);
			this.host = this.players[this.players.length - 1];
		}

		this.assignParties = function() {
			// Generate random order of player indices
			var nPlayers = this.players.length;
			var arr = [];
			for (var i = 0; i < nPlayers; i++) {
				arr.push(i);
			}
			arr = utils.shuffle(arr);

			this.players[arr.pop()].assignRole(player.HITLER_ROLE);


			if (nPlayers >= 9) {
				nFascists = 3;
			}
			else if (nPlayers >= 7) {
				nFascists = 2;
			}
			else {
				nFascists = 1;
			}

			while (nFascists > 0) {
				this.players[arr.pop()].assignRole(player.FASCIST_ROLE);
				nFascists--;
			}

			while (arr.length > 0) {
				this.players[arr.pop()].assignRole(player.LIBERAL_ROLE);
			}
		}

		this.selectFirstPresident = function () {
			var n = Math.floor(this.players.length * Math.random());
			this.players[n].makePresident();
			this.president = this.players[n];
		}

		this.sendStartInfo = function () {
			var players = [];
			for (var i = 0; i < this.players.length; i++) {
				players.push(this.players.name);
			}
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(startInfoMsg, {
					party: this.players[i].party,
					role: this.players[i].role,
					players: players,
					president: this.president.id
				});
			}
		}

		this.startGame = function () {
			this.assignParties();
			this.selectFirstPresident();
			this.sendStartInfo();
		}

		this.sendCandidates = function ()  {
			var candidates = [];
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].isElligibleChancellor()) {
					candidates.push(i);
				}
			}
			this.president.emit(nominationCandidateListMsg, {
				candidates: candidates
			});

		}

		this.nominateChancellor = function (chancellorId) {
			
		}
	}
};