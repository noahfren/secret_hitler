const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";

const NO_POSITION = 0;
const PRESIDENT = 1;
const CHANCELLOR = 2;
const INELLIGIBLE = 3;

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