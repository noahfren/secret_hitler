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
var lib_policies = 0;
var fas_policies = 0;

function hidePlayerAssignmentCard() {
	partyViewDiv.hide();
}

function hideNotification() {
	notificationDiv.hide();
}

function voteYes() {
	voteDiv.hide();
}

function voteNo() {
	voteDiv.hide();
}

function discardPolicy(e) {
	discard_index = parseInt(e.path[0].id.charAt(15))
	console.log("discarding policy " + discard_index)
	discardDiv.hide();
}

function selectPolicy(e) {
	discard_index = parseInt(e.path[0].id.charAt(14))
	console.log("discarding policy " + discard_index)
	selectDiv.hide();
}

function selectPlayer(e) {
	dropdown = $("#player-select-dropdown").find("option:selected").attr("data-value");
	console.log(dropdown)
}

function notificationHelper(text) {
	notificationText.html(text);
}

$().ready(function () {

	partyViewDiv = $('#player-assignment');
	notificationDiv = $('#notification');
	notificationText = $('#notification-title h3');
	voteDiv = $('#vote-card');
	discardDiv = $('#discard-policy-card');
	selectDiv = $('#policy-card');
	playerSelectDiv = $("#select-player-card");
	dropdownHTML = $("#player-select-dropdown select");
	presidentHand0 = $("discard-policy-0");
	presidentHand1 = $("discard-policy-1");
	presidentHand2 = $("discard-policy-2");
	chancellorHand0 = $("select-policy-0");
	chancellorHand1 = $("select-policy-1");


	// Set player info and display assignment card
	socket.on(startInfoMsg, function(msg) {
		playerID = msg.id;
		players = msg.players;
		curPresident = msg.president;
		roleImgFilepath = 'img/president_card.png'; // Weird filename, actually hitler card - should be fuhrer_card.png if anything
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

	// President must choose chancellor nominee
	socket.on(nominationCandidateListMsg, function(msg) {
		for (var i = 0; i < msg.candidates.length; i++) {
			candidateName = msg.candidates[i].name; // Display this in selector
			candidateId = msg.candidates[i].id; // Return this in response

			// TODO: Add candidate selctions to dropdownHTML
			dropdownHTML.empty();
			for (var i = msg.candidates.length - 1; i >= 0; i--) {
				id_num = msg.candidates[i].id;
				player_name = msg.candidates[i].name;
				dropdownHTML.append($('<option>', {
				    value: id_num,
				    text: player_name
				}));
			};

		}
	});

	socket.on(presidentPolicyHandMsg, function(msg)) {
		if(msg.hand[0] == LIBERAL) {
			presidentHand0.attr("src","img/liberal_policy_card.png");
		}
		else {
			presidentHand0.attr("src","img/fascist_policy_card.png");
		}

		if(msg.hand[1] == LIBERAL) {
			presidentHand1.attr("src","img/liberal_policy_card.png");
		}
		else {
			presidentHand1.attr("src","img/fascist_policy_card.png");
		}

		if(msg.hand[2] == LIBERAL) {
			presidentHand2.attr("src","img/liberal_policy_card.png");
		}
		else {
			presidentHand2.attr("src","img/fascist_policy_card.png");
		}
	}

	socket.on(chancellorPolicyHandMsg, function(msg)) {
		if(msg.hand[0] == LIBERAL) {
			chancellorHand0.attr("src","img/liberal_policy_card.png");
		}
		else {
			chancellorHand0.attr("src","img/fascist_policy_card.png");
		}

		if(msg.hand[1] == LIBERAL) {
			chancellorHand1.attr("src","img/liberal_policy_card.png");
		}
		else {
			chancellorHand1.attr("src","img/fascist_policy_card.png");
		}
	}

	socket.on(chancellorSelectedMsg, function(msg)) {
		notificationHelper(msg.chancellor + " has been elected Chancellor!");
	}

	socket.on(policyPlayedMsg, function(msg)) {
		notificationHelper(msg.chancellor + " has enacted a " + msg.policy + " POLICY")
		if(msg.policy == LIBERAL)
		{
			$('#lib-policy-card-' + lib_policies).show();
			lib_policies++;
		}
		else {
			$('#fas-policy-card-' + fas_policies).show();
			fas_policies++;
		}
	}

	// Player votes on chancellor nomination
	socket.on(chancellorVoteMsg, function(msg) {
		// TODO: Change text to say who player is voting for
		voteDiv.show();
	});

});