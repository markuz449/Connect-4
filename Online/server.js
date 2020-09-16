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
  player_queue.push(socket.id);
  socket.emit('new_player', {user_id: socket.id});

  // Listens if a player disconnects
  // Checks if they were in a game or not
  socket.on('disconnect', () => {
    console.log("Player disconnected from queue");
    var removeIndex = player_queue.indexOf(socket.id);
    if (removeIndex > -1) {
      player_queue.splice(removeIndex, 1);
    } else{
      for(let i = 0; i < current_games.length; i++){
        if(current_games[i].player1 == socket.id){
          io.to(current_games[i].player2).emit('forfeit_win');
          current_games.splice(i, 1);
          break;
        } else if(current_games[i].player2 == socket.id){
          io.to(current_games[i].player1).emit('forfeit_win');
          current_games.splice(i, 1);
          break;
        }
      }
    }
  });

  // Generates a new game between two different players
  if (player_queue.length > 1){
    console.log("Starting new game");
    var game_id = uuidv4();
    var player1_id = player_queue.pop();
    var player2_id = player_queue.pop();
    var player_start = Math.round(Math.random());

    let new_game = {game_id: game_id, player1: player1_id, player2: player2_id};
    current_games.push(new_game);

    if (player_start == 1){
      io.to(player1_id).emit('new_game', {game_id: game_id, start_player: 1})
      io.to(player2_id).emit('new_game', {game_id: game_id, start_player: 2})
    } else{
      io.to(player1_id).emit('new_game', {game_id: game_id, start_player: 2})
      io.to(player2_id).emit('new_game', {game_id: game_id, start_player: 1})
    }
  }

  //listen on new_message
  socket.on('players_choice', (data) => {
    let game_index = -1;
    for (let i = 0; i < current_games.length; i++){
      if (current_games[i].game_id == data.game_id){
        game_index = i;
        break;
      }
    }
    if (game_index >= 0){
      current_game = current_games[game_index];
      if (current_game.player1 == socket.id){
        console.log("Sending to: " + current_game.player2);
        io.to(current_game.player2).emit('opponents_move', data);
      } else{
        console.log("Sending to: " + current_game.player1);
        io.to(current_game.player1).emit('opponents_move', data);
      }
    } else{
      console.log("Error with game communication");
    }
  });

});
