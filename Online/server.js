var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var {v4: uuidv4 }  = require("uuid");

var app = express();
var root = __dirname + "/public";

var player_queue = [];
var current_games = [];

// Setting game timer
var game_timer = setInterval(start_game, 3000);

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
  // Checks if they were in a game or not, if so, tell the opponent that they forfeited
  socket.on('disconnect', () => {
    console.log("Player disconnected from queue");
    var removeIndex = player_queue.indexOf(socket.id);
    if (removeIndex > -1) {
      player_queue.splice(removeIndex, 1);
    } else{
      let game_index = -1;
      for(game_index = 0; game_index < current_games.length; game_index++){
        if(current_games[game_index].player1 == socket.id){
          io.to(current_games[game_index].player2).emit('forfeit_win');
          current_games[game_index].player1 = null;
          break;
        } else if(current_games[game_index].player2 == socket.id){
          io.to(current_games[game_index].player1).emit('forfeit_win');
          current_games[game_index].player2 = null;
          break;
        }
      }
      // Checks if no one is connected to the current game, if so, remove it.
      if (game_index >= 0 && game_index <= current_games.length){
        if (current_games[game_index].player1 == null && current_games[game_index].player2 == null){
          current_games.splice[game_index, 1];
        }
      }
    }
  });

  //listen on new_message and then sends the move to the opponent
  socket.on('players_choice', (data) => {
    let game_index = get_game_index(data.game_id);
    if (game_index >= 0){
      current_game = current_games[game_index];
      if (current_game.player1 == socket.id){
        io.to(current_game.player2).emit('opponents_move', data);
      } else{
        io.to(current_game.player1).emit('opponents_move', data);
      }
    } else{
      console.log("Error with game communication");
    }
  });

  //listens if the user wants to play again
  //FUTURE -- set a timer so the same two clients can play each other again
  socket.on('play_again', (data) => {
    console.log("Play again")
    let game_index = get_game_index(data.game_id);
    if (game_index >= 0){
      game = current_games[game_index];
      //Sets their refrence in game to null
      if (game.player1 == data.user_id){
        game.player1 = null;
      } else{
        game.player2 = null;
      }
      //If both clients have left, remove the game from the list
      if (game.player1 == null && game.player2 == null){
        current_games.splice(game_index, 1);
      }
      //Add the player back to the queue
      player_queue.push(data.user_id);
    }
  });

});

// Timed function that gets called every 3 seconds, checks if a game should start
function start_game(){
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
}


/* Supporting functions */
function get_game_index(game_id){
  let game_index = -1;
  for (let i = 0; i < current_games.length; i++){
    if (current_games[i].game_id == game_id){
      game_index = i;
      break;
    }
  }
  return game_index;
}
