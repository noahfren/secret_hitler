const startInfoMsg = "startInfo";
const nominationCandidateListMsg = "nominationCandidateList";

var POPUP_TIMEOUT = 5;

var partyViewDiv = $('#party-view');

$().ready(function () {
	socket.on(startInfoMsg, function(msg) {
		partyViewDiv.append('<p>'+msg+'</p>');
		partyViewDiv.show();
		setTimeout(function () {
			partyViewDiv.hide();
		}, POPUP_TIMEOUT * 1000);
	});
});