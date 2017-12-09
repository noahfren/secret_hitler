// Socket IO message names
const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";
const chancellorVoteMsg = "chancellorVote";
const chancellorSelectedMsg = "chancellorSelected"
const presidentPolicyHandMsg = "presidentPolicyHand";
const chancellorPolicyHandMsg = "chancellorPolicyHand";
const policyPlayedMsg = "policyPlayed";
const newRoundMsg = "newRound";
const playerExecutedMsg = "playerExecuted";
const gameOverMsg = "gameOver";

// Socket IO response names
const nominationCandidateListRespMsg = "nominationCandidateListResp";
const chancellorVoteRespMsg = "chancellorVoteResp";
const presidentPolicyHandRespMsg = "presidentPolicyHandResp";
const chancellorPolicyHandRespMsg = "chancellorPolicyHandResp";
const executionChoiceRespMsg = "executionChoiceResp";

// Card Val Consts
const LIBERAL = 'LIBERAL';
const FASCIST = 'FASCIST';

// Player Positions
const NO_POSITION = 0;
const PRESIDENT = 1;
const CHANCELLOR = 2;
const INELLIGIBLE = 3;

// Game Over Casue Const
const HITLER_ELECTED = 0;
const FASCIST_POLICIES = 1;
const LIBERAL_POLICIES = 2;
const HITLER_KILLED = 3;

// Player Roles
const LIBERAL_ROLE = 0;
const FASCIST_ROLE = 1;
const HITLER_ROLE = 2;

var partyViewDiv = {};

var POPUP_TIMEOUT = 5 * 1000;

var playerID = 0;
var playerRole = HITLER_ROLE;
var playerPosition = NO_POSITION;

var players = [];
var curPresident = 0;
var curChancellor = 0;
var lib_policies = 0;
var fas_policies = 0;

var is_execution = false;
var is_president = false;
var is_chancellor = false;

var displayQueue = [];

function sendVote(vote) {
	socket.emit(chancellorVoteRespMsg, {
		gameCode: gameCode,
		playerId: playerID,
		vote: vote
	});
}

function showRole() {
	showRoleCard.show();
	showRoleX.show();
	showRoleButton.hide();
}

function hideRole() {
	showRoleButton.show();
	showRoleX.hide();
	showRoleCard.hide();
}

function delayDisplay(div) {
	if(notificationDiv.is(':visible') || partyViewDiv.is(':visible')) {
		displayQueue.push(div);
	}
	else {
		div.show();
	}
}

function displayNext() {
	if (displayQueue.length > 0) {
		displayQueue[0].show();
		displayQueue = displayQueue.slice(1);
	}
}

function hidePlayerAssignmentCard() {
	partyViewDiv.hide();
	displayNext();
}

function hidePolicyPeek(){
	policyPeekDiv.hide();
	displayNext();
}

function hideNotification() {
	notificationDiv.hide();
	displayNext();
}

function voteYes() {
	voteDiv.hide();
	sendVote(true);
}

function voteNo() {
	voteDiv.hide();
	sendVote(false);
}

function discardPolicy(e) {
	discard_index = parseInt(e.path[0].id.charAt(15));
	discardDiv.hide();
	socket.emit(presidentPolicyHandRespMsg,{
		gameCode: gameCode,
		discardIndex: discard_index
	});

}

function selectPolicy(e) {
	selected_index = parseInt(e.path[0].id.charAt(14));
	selectDiv.hide();
	socket.emit(chancellorPolicyHandRespMsg, {
		gameCode: gameCode,
		selectedIndex: selected_index
	});
}

function selectPlayer() {
	playerSelectDiv.hide();
	selected_player = $("#player-select-dropdown").find("option:selected").attr("data-value");
	console.log(selected_player);
	if (is_execution) {
		is_execution = false;
		socket.emit(executionChoiceRespMsg, {
			gameCode: gameCode,
			executeIndex: selected_player
		});
	}
	else {
		socket.emit(nominationCandidateListRespMsg, {
			gameCode: gameCode,
			nomineeIndex: selected_player
		});
	}
}

function notificationHelper(text) {
	notificationText.text(text);
	notificationDiv.show();
}


$().ready(function () {

	gameScreen = $("#game-screen");
	presidentInfo = $("#president-info");
	chancellorInfo = $('#chancellor-info');
	partyViewDiv = $('#player-assignment');
	policyPeekDiv = $('#policy-peek-card');
	notificationDiv = $('#notification');
	notificationText = $('#notification-title');
	voteDiv = $('#vote-card');
	discardDiv = $('#discard-policy-card');
	selectDiv = $('#policy-card');
	playerSelectDiv = $("#select-player-card");
	dropdownHTML = $("#player-select-dropdown");
	presidentHand0 = $("#discard-policy-0");
	presidentHand1 = $("#discard-policy-1");
	presidentHand2 = $("#discard-policy-2");
	chancellorHand0 = $("#select-policy-0");
	chancellorHand1 = $("#select-policy-1");
	showRoleButton = $("#show-role-btn");
	showRoleCard = $("#show-role-card");
	showRoleX = $("#hide-role");
	libWin = $("#lib-end");
	fasWin = $("#fas-end");
	endMsgLib = $("#end-msg-lib");
	endMsgFas = $("#end-msg-fas");
	policyPeekCard = $("#policy-peek-card");


	// Set player info and display assignment card
	socket.on(startInfoMsg, function(msg) {
		playerID = msg.id;
		players = msg.players;

		roleImgFilepath = "";
		if (msg.role == FASCIST_ROLE) {
			roleImgFilepath = 'img/fascist_card.png';
			playerRole = FASCIST_ROLE;
			var fascistText = "Fascists:\n";
			for (var i = 0; i < msg.fascistNames.length; i++) {
				fascistText += msg.fascistNames[i] + '\n';
			}
			var hitlerText = "Hitler:\n" + msg.hitlerName;
			$("#fascist-info").text(fascistText);
			$("#hitler-info").text(hitlerText);
			$("#fascist-info-row").show();
		}
		else if (msg.role == LIBERAL_ROLE) {
			roleImgFilepath = 'img/liberal_card.png';
			playerRole = LIBERAL_ROLE;
		}
		else
		{
			roleImgFilepath = 'img/president_card.png'; // Weird filename, actually hitler card - should be fuhrer_card.png if anything
		}
		$('#card-img').attr('src', roleImgFilepath);
		$("#show-role-card").attr('src', roleImgFilepath);
		partyViewDiv.show();
	});

	// Set up round
	socket.on(newRoundMsg, function(msg) {
		presidentInfo.text("President: " + msg.presidentName);
		chancellorInfo.text("Waiting for Nomination");
		if (msg.presidentId == playerID) {
			is_president = true;
		} 
		else {
			is_president = false;
		}
		is_chancellor = false;
	});

	// President must choose chancellor nominee
	socket.on(nominationCandidateListMsg, function(msg) {
		console.log(msg);
		dropdownHTML.empty();
		if (msg.isExecution) {
			is_execution = true;
			$("#select-player-text").text("Select a Player to Execute");
			$("#select-player-btn").text("Execute Player");
		}
		else {
			is_execution = false;
			$("#select-player-text").text("Select a Chancellor Nominee");
			$("#select-player-btn").text("Submit Nominee");

		}
		for (var i = 0; i < msg.candidates.length; i++) {
			candidateName = msg.candidates[i].name; // Display this in selector
			candidateId = msg.candidates[i].id; // Return this in response
			dropdownHTML.append(
				$('<option></option>')
					.attr("data-value",candidateId)
					.text(candidateName)
			);
		}
		delayDisplay(playerSelectDiv);
	});

	socket.on(presidentPolicyHandMsg, function(msg) {
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
		delayDisplay(discardDiv);
	});

	socket.on(policyPeekMsg, function(msg)) {
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
		delayDisplay(policyPeekCard);
	}

	socket.on(chancellorPolicyHandMsg, function(msg) {
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
		delayDisplay(selectDiv);
	});

	socket.on(chancellorSelectedMsg, function(msg) {
		console.log("Chancellor selected!");
		notificationHelper(msg.chancellorName + " has been elected Chancellor!");
		chancellorInfo.text("Chancellor: " + msg.chancellorName);
		if (msg.chancellorId == playerID) {
			is_chancellor = true;
		}
	});

	socket.on(policyPlayedMsg, function(msg) {
		console.log("Policy played!");
		notificationHelper("Chancellor " + msg.chancellor + " has enacted a " + msg.policy + " POLICY");
		console.log(msg);
		if(msg.policy == LIBERAL)
		{
			lib_policies++;
			console.log("Num liberal: " + lib_policies);
			var tmp = $('#lib-policy-card-' + lib_policies);
			console.log(tmp);
			tmp.show();
		}
		else {
			fas_policies++;
			console.log("Num fascist: " + fas_policies);
			var tmp = $('#fas-policy-card-' + fas_policies);
			console.log(tmp);
			tmp.show();
		}
	});

	// Player votes on chancellor nomination
	socket.on(chancellorVoteMsg, function(msg) {
		console.log("REcieved vote msg for " + msg.chancellorName);
		$('#elect_title').text("Elect " + msg.chancellorName +" as Chancellor?");
		delayDisplay(voteDiv);
	});

	socket.on(playerExecutedMsg, function(msg) {
		playerID = msg.newId;
		if (msg.executedName == name) {
			notificationHelper("You were executed by " + msg.presidentName + "!");
		}
		else {
			notificationHelper("President " + msg.presidentName + " executed " + msg.executedName + "!");
		}
	});

	socket.on(gameOverMsg, function(msg) {
		console.log("Game Over!");
		var text = "";
		if (msg.cause == HITLER_ELECTED) {
			text += "Hitler was elected chancellor."
			endMsgFas.text(text);
			gameScreen.hide();
			fasWin.show();
		}
		else if (msg.cause == FASCIST_POLICIES) {
			text += "6 Fascist policies were played."
			endMsgFas.text(text);
			gameScreen.hide();
			fasWin.show();
		}
		else if (msg.cause == LIBERAL_POLICIES) {
			text += "5 Liberal policies were played."
			endMsgLib.text(text);
			gameScreen.hide();
			libWin.show();
		}
		else {
			text += "Hitler was assasinated!"
			endMsgLib.text(text);
			gameScreen.hide();
			libWin.show();
		}
		
	});

});