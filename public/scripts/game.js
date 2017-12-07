// Socket IO message names
const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";
const chancellorVoteMsg = "chancellorVote";
const chancellorSelectedMsg = "chancellorSelected"
const presidentPolicyHandMsg = "presidentPolicyHand";
const chancellorPolicyHandMsg = "chancellorPolicyHand";
const policyPlayedMsg = "policyPlayed";
const newRoundMsg = "newRound";

// Card Val Consts
const LIBERAL = 'LIBERAL';
const FASCIST = 'FASCIST';

// Player Positions
const NO_POSITION = 0;
const PRESIDENT = 1;
const CHANCELLOR = 2;
const INELLIGIBLE = 3;

// Player Roles
const LIBERAL_ROLE = 0;
const FASCIST_ROLE = 1;
const HITLER_ROLE = 2;

var partyViewDiv = {};

var POPUP_TIMEOUT = 10 * 1000;

var playerID = 0;
var playerRole = HITLER_ROLE;
var playerPosition = NO_POSITION;

var players = [];
var curPresident = 0;
var curChancellor = 0;

function hidePlayerAssignmentCard() {
	partyViewDiv.hide();
}

function voteYes() {
	
}

function voteNo() {

}

function discardPolicy(e) {
	discard_index = parseInt(e.path[0].id.charAt(15))
	console.log("discarding policy " + discard_index)
}

function selectPolicy(e) {
	discard_index = parseInt(e.path[0].id.charAt(14))
	console.log("discarding policy " + discard_index)
}

$().ready(function () {

	partyViewDiv = $('#player-assignment');

	// Set player info and display assignment card
	socket.on(startInfoMsg, function(msg) {
		playerID = msg.id;
		players = msg.players;
		curPresident = msg.president;
		roleImgFilepath = 'img/president_card.png'; // Weird filename, actually hitler card
		if (msg.role == FASCIST_ROLE) {
			roleImgFilepath = 'img/fascist_card.png';
			playerRole = FASCIST_ROLE;
		}
		else if (msg.role == LIBERAL_ROLE) {
			roleImgFilepath = 'img/liberal_card.png';
			playerRole = LIBERAL_ROLE;
		}
		partyViewDiv.children('#card-img').attr('src', roleImgFilepath);
		partyViewDiv.show();
	});

});