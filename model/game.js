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

// Policy Card Vals
const LIBERAL = 'LIBERAL';
const FASCIST = 'FASCIST';

// Player Position consts
const NO_POSITION = 0;
const PRESIDENT = 1;
const CHANCELLOR = 2;
const INELLIGIBLE = 3;

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

// Socket IO message names
const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";
const chancellorVoteMsg = "chancellorVote";
const chancellorSelectedMsg = "chancellorSelected"
const presidentPolicyHandMsg = "presidentPolicyHand";
const chancellorPolicyHandMsg = "chancellorPolicyHand";
const policyPlayedMsg = "policyPlayed";
const newRoundMsg = "newRound";

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
		this.numLiberalPolicies = 0;
		this.numFascistPolicies = 0;

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
			var playerNames = [];
			for (var i = 0; i < this.players.length; i++) {
				playerNames.push(this.players.name);
			}
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(startInfoMsg, {
					id: i,
					role: this.players[i].role,
					players: playerNames.slice()
				});
			}
		}

		this.startGame = function () {
			this.assignParties();
			this.selectFirstPresident();
			this.sendStartInfo();
			this.newRound();
		}

		// Send candidate list to president
		this.sendCandidates = function ()  {
			var candidates = [];
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].isElligibleChancellor()) {
					candidates.push(i);
				}
			}
			this.president.emit(nominationCandidateListMsg, {
				candidates: candidates.slice();
			});

		}

		// Send chancellor nomination to players for voting
		this.nominateChancellor = function (chancellorId) {
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(chancellorVoteMsg, {
					chancellorId: chancellorId
				});
			}
			this.votes = 
		}

		this.tallyVote = function (playerId, )

		// If election is successful set new chancellor
		this.electChancellor = function (chencellorId) {
			this.chancellor = this.players[chancellorId];
			// TODO : check game over
			this.chancellor = this.players[chancellorId];
			this.chancellor.makeChancellor();
			for (var i = 0; 9 < this.players.length; i++) {
				this.players[i].emit(chancellorSelectedMsg, {
					chancellor: chancellorId
				});
			}
		}

		// Send president policy cards so they can discard one
		this.sendPresidentHand = function () {
			this.hand = this.deck.getHand()
			this.president.emit(presidentPolicyHandMsg, {
				hand: this.hand.slice()
			});
		}

		// Discard president choice and send Chancellor policy cards to play
		this.sendChancellorHand = function (discardedPolicyIndex) {
			this.deck.discardUnused(this.hand[discardedPolicyIndex]);
			this.hand = this.hand.splice(discardedPolicyIndex, 1);
			this.chancellor.emit(chancellorPolicyHandMsg, {
				hand: this.hand.slice()
			});
		}

		this.playPolicy = function (playedPolicyIndex) {
			var playedPolicy = this.hand[playedPolicyIndex];
			this.hand = this.hand.splice(playedPolicyIndex, 1);
			this.deck.discardUnused(this.hand[0]);
			this.hand = [];
			if (playedPolicy == LIBERAL) {
				this.liberalPoliciesPlayed += 1;
			}
			else {
				this.fascistPoliciesPlayed += 1;
			}
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(policyPlayedMsg, {
					playedPolicy: playedPolicy
				});
			}
			// TODO: Check game over
			// TODO: Executive Actions
		}

		this.newRound = function () {
			this.round += 1;
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].position == PRESIDENT || this.players[i].position == CHANCELLOR) {
					this.players[i].position = INELLIGIBLE;
				}
				else if (this.players[i].position == INELLIGIBLE) {
					this.players[i],position == NO_POSITION;
				}
			}
			this.president = this.president.id + 1;
			this.president.makePresident();
			for (var i =0; i < this.players.length; i++) {
				this.players[i].emit(newRoundMsg, {
					round: this.round,
					president: this.president.id
				});
			}
			this.sendCandidates();
		}
	}
};