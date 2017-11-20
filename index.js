var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var game = require('./game.js');

var newGameMsg = 'newGame';
var joinGameMsg = 'joinGame';
var playerJoinedMsg = 'playerJoined';
var gameReadyMsg = 'gameReady';

var joinGameRespMsg = 'joinGameResp';

var nameTakenErr = 'nameTaken';
var invalidGameCodeErr = 'invalidGameCode';

app.use(express.static(__dirname + '/public'));

// Map game code to game
var games = new Map();

app.get('/', function(request, response){
	response.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.on(newGameMsg, function(msg){
		games.set(msg.gameCode, new game.Game(msg.gameCode));
		var curGame = games.get(msg.gameCode);
		curGame.addHost(msg.playerName, socket);
		socket.emit(playerJoinedMsg, {});
  	});

  	socket.on(joinGameMsg, function(msg){
		if (!games.has(msg.gameCode)) {
			// join was unsucessful, send error
			socket.emit(joinGameRespMsg, {
				status: false,
				err: invalidGameCodeErr
			});
			return;
		}
		var curGame = games.get(msg.gameCode);
		if (!curGame.addPlayer(msg.playerName, socket)) {
			socket.emit(joinGameRespMsg, {
				status: false,
				err: nameTakenErr
			});
			return;
		}
		curGame.host.socket.emit(playerJoinedMsg, {});
		socket.emit(joinGameRespMsg, {
			status: true
		});
		console.log(curGame.players.length);
  	});
});

http.listen(3000, function(){
	console.log("Listening on port 3000");
});

