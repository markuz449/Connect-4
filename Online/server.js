var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var {v4: uuidv4 }  = require("uuid");

var app = express();
var root = __dirname + "/public";

var player_queue = [];
var current_games = [];

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Simple logger
/*app.use(function(req, res, next){
  console.log("%s %s", req.method, req.url);
  next();
});*/

// Error handler
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

// Serve static files from directory
app.use(express.static(root));

// Open server on specified port
console.log("Starting Express Server");
server = app.listen(6969);


//socket.io instantiation
const io = require("socket.io")(server);

//listen on every connection
io.on('connection', (socket) => {
  console.log('New player connected');
  socket.user_id = uuidv4();
  player_queue.push(socket.user_id);
  socket.emit('new_player', {user_id: socket.user_id});

  //listen if a player disconnects
  socket.on('disconnect', () => {
    console.log("Player Disconnected");
    var removeIndex = player_queue.indexOf(socket.user_id);
    if (removeIndex > -1) {
      player_queue.splice(removeIndex, 1);
    } 
  });

  // Generates a new game between two different players
  if (player_queue.length > 1){
    console.log("Starting new game");
    var game_id = uuidv4();
    var player1_id = player_queue.pop();
    var player2_id = player_queue.pop();
    let new_game = {game_id: game_id, player1: player1_id, player2: player2_id};
    current_games.push(new_game);
    io.sockets.emit('new_game', new_game);
  }

  //listen on new_message
  socket.on('players_choice', (data) => {
    //broadcast the new message
    console.log("Choice: " + data.choice + ", Game ID: " + data.game_id);
    io.sockets.emit('players_move', data);
  });

});
