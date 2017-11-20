var newGameMsg = 'newGame';
var joinGameMsg = 'joinGame';
var playerJoinedMsg = 'playerJoined';
var gameReadyMsg = 'gameReady';

var newGameRespMsg = 'newGameResp';
var joinGameRespMsg = 'joinGameResp';

var name = "";
var gameCode = "";

var nameTakenErr = 'nameTaken';
var invalidGameCodeErr = 'invalidGameCode';

var playersJoined = 0;

$().ready(function () {
    enterNameDiv = $('#name-form');
    joinGameDiv = $('#join-game-form');
    createGameDiv = $('#create-game-form');
    waitingDiv = $('#waiting-message');

    socket.on(playerJoinedMsg, function(msg){
      playersJoined++;
      $('#players-joined-counter').text(parseInt(playersJoined));
    });

    socket.on(joinGameRespMsg, function(msg){
      console.log(msg);
      if (msg.status == true) {
        console.log("Join game success")
        joinGameDiv.hide();
        waitingDiv.show();
      }
      else if (msg.err == invalidGameCodeErr){
        alert("Unable to join game, please enter a valid game code.");
        $('#gameCodeInputField').val("");
      }
      else {
        alert("This name is taken in this game, please use a different one.");
        name = "";
        joinGameDiv.hide();
        enterNameDiv.show();
      }
    });
  });

// Generate new game code
function generateGameCode() {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 6; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;

}

function newGameHandler() {
  var nameInputField = $('#nameInputField');
  name = nameInputField.val();
  nameInputField.text("");

  gameCode = generateGameCode();
  $('#game-code').text(gameCode);

  socket.emit(newGameMsg, {
    playerName: name, 
    gameCode: gameCode
  });
  enterNameDiv.hide();
  createGameDiv.show();
}

function joinGameHandler() {
  var nameInputField = $('#nameInputField');
  name = nameInputField.val();
  if (name == "") {
    alert("Please Enter a Valid, Non-Empty Name.");
    return;
  }
  nameInputField.val("");

  enterNameDiv.hide();
  joinGameDiv.show();
}

function joinGameSubmitHandler() {
  var gameCodeInputField = $('#gameCodeInputField');
  gameCode = gameCodeInputField.val();

  socket.emit(joinGameMsg, {
    playerName: name, gameCode: gameCode
  });
}

function startNewGameHandler() {
  socket.emit(gameReadyMsg, {
    gameCode: gameCode
  });
}