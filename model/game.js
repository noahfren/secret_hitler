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

// Game Over Casue Const
const HITLER_ELECTED = 0;
const FASCIST_POLICIES = 1;
const LIBERAL_POLICIES = 2;
const HITLER_KILLED = 3;

// Socket IO message names
const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";
const chancellorVoteMsg = "chancellorVote";
const chancellorSelectedMsg = "chancellorSelected"
const presidentPolicyHandMsg = "presidentPolicyHand";
const chancellorPolicyHandMsg = "chancellorPolicyHand";
const policyPlayedMsg = "policyPlayed";
const newRoundMsg = "newRound";
const gameOverMsg = "gameOver";

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
		this.electionTracker = 0;

		this.removeCardAtIndex = function (index) {
			var temp = [];
			for (var i = 0; i < this.hand.length; i++) {
				if (i != index) {
					temp.push(this.hand[i]);
				}
			}
			this.hand = temp;
		}

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
					candidates.push({name: this.players[i].name, id: i});
				}
			}
			this.president.emit(nominationCandidateListMsg, {
				candidates: candidates.slice()
			});

		}

		// Send chancellor nomination to players for voting
		this.nominateChancellor = function (chancellorIndex) {
			this.nominee = this.players[chancellorIndex];
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(chancellorVoteMsg, {
					chancellorName: this.nominee.name
				});
			}
			this.votes = [];
			this.numVotes = 0;
			for (var i = 0; i < this.players.length; i++) {
				this.votes.push(false);
			}
		}

		this.tallyVote = function (playerId, vote) {
			this.votes[playerId] = vote;
			this.numVotes += 1;
			console.log(playerId + " voted " + vote);
			if (this.numVotes == this.players.length) {
				var numYes = 0;
				var numNo = 0;
				for (var i = 0; i < this.players.length; i++) {
					if (this.votes[i]) {
						numYes += 1;
					}
					else {
						numNo += 1;
					}
				}
				if (numYes > numNo) {
					this.electChancellor()
				}
				else {
					this.electionTracker += 1;
					if (this.electionTracker == 3) {
						this.electionsFailed();
					}
					else {
						this.newRound();
					}
				}
			}
		}

		// If election is successful set new chancellor
		this.electChancellor = function () {
			console.log("Chancellor elected: " + this.nominee.name);
			this.electionTracker = 0;
			this.chancellor = this.nominee;
			this.chancellor.makeChancellor();
			if (this.checkGameOver()) {
				return;
			}
			for (var i = 0; i < this.players.length; i++) {
				this.players[i].emit(chancellorSelectedMsg, {
					chancellorName: this.chancellor.name,
					chancellorId: this.chancellor.id
				});
			}
			this.sendPresidentHand();
		}

		// Send president policy cards so they can discard one
		this.sendPresidentHand = function () {
			this.hand = this.deck.getHand()
			console.log(this.hand);
			this.president.emit(presidentPolicyHandMsg, {
				hand: this.hand.slice()
			});
		}

		// Discard president choice and send Chancellor policy cards to play
		this.sendChancellorHand = function (discardedPolicyIndex) {
			console.log("President discarded policy " + discardedPolicyIndex);
			this.deck.discardUnused(this.hand[discardedPolicyIndex]);
			this.removeCardAtIndex(discardedPolicyIndex);
			console.log(this.hand);
			this.chancellor.emit(chancellorPolicyHandMsg, {
				hand: this.hand.slice()
			});
		}

		this.playPolicy = function (playedPolicyIndex) {
			console.log('Chancellor played policy ' + playedPolicyIndex);
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
					chancellor: this.chancellor.name,
					policy: playedPolicy
				});
			}
			if (this.checkGameOver()) {
				return;
			}
			// TODO: Executive Actions
			this.newRound();
		}

		this.newRound = function () {
			this.round += 1;
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].position == PRESIDENT || this.players[i].position == CHANCELLOR) {
					this.players[i].position = NO_POSITION;
					//this.players[i].position = INELLIGIBLE;
				}
				else if (this.players[i].position == INELLIGIBLE) {
					this.players[i].position = NO_POSITION;
				}
			}
			this.president = this.players[(this.president.id + 1) % this.players.length];
			this.president.makePresident();
			for (var i =0; i < this.players.length; i++) {
				this.players[i].emit(newRoundMsg, {
					round: this.round,
					presidentName: this.president.name,
					presidentId: this.president.id,
					electionTracker: this.electionTracker
				});
			}
			this.sendCandidates();
		}

		// TODO: this guy
		this.electionsFailed = function () {
			this.electionTracker = 0;
			this.newRound();
		}

		// TODO
		this.checkGameOver = function () {
			if (this.chancellor.isHitler() && this.fascistPoliciesPlayed > 3) {
				for (var i = 0; i < this.players.length; i++) {
					this.players[i].emit(gameOverMsg, {
						cause: HITLER_ELECTED
					});
					return true;
				}
			}
			if (this.fascistPoliciesPlayed == 6) {
				// GAME OVER
				for (var i = 0; i < this.players.length; i++) {
					this.players[i].emit(gameOverMsg, {
						cause: FASCIST_POLICIES
					});
					return true;
				}
			}
			if (this.liberalPoliciesPlayed == 5) {
				// GAME OVER
				for (var i = 0; i < this.players.length; i++) {
					this.players[i].emit(gameOverMsg, {
						cause: LIBERAL_POLICIES
					});
					return true;
				}
			}
		}

		// TODO
		this.policyPeek = function () {

		}

		// TODO
		this.selectPlayerToKill = function () {

		}

		// TODO
		this.killPlayer = function () {

		}
	}
};