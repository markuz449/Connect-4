var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var {v4: uuidv4 }  = require("uuid");
var path = require("path");
var {transports, createLogger, format} = require('winston');

var app = express();
var root = path.join(__dirname + "/public");

var current_players = [];
var current_games = [];

// Setting timers
var game_timer = setInterval(start_game, 3000);
var online_num_update_timer = setInterval(update_online_num, 3000);

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Simple Winston logger
const logger = createLogger({
  format: format.combine(
      format.timestamp(),
      format.json()
  ),
  transports: [
      new transports.Console(),
      new transports.File({filename: 'logs/Connect-4.log', level:'info'})
  ]
});

// Error handler
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

// Serve static files from directory
app.use(express.static(root, {extensions:['html']}));

// Open server on specified port
console.log("Starting Express Server");
server = app.listen(6969);

// Socket.io instantiation
const io = require("socket.io")(server);


// Listen on every connection
io.on('connection', (socket) => {
  console.log(socket.id);
  var player_id = uuidv4();
  socket.emit('new_player_id', {player_id: player_id});

  // Listens for when the player connects
  socket.on('player_connect', () => {
    logger.info({message:('New player connected: ' + player_id)});
    var new_player = {socket_id: socket.id, player_id: player_id, game_id: null};
    current_players.push(new_player);
    logger.info({message:("Current Players: " + current_players.length)});
    socket.emit('new_player', {player_id: player_id, online_num: current_players.length});
  });

  // Listens if a player disconnects
  // Checks if they were in a game or not, if so, tell the opponent that they forfeited
  socket.on('disconnect', () => {
    logger.info({message:("Socket: " + socket.id + " disconnecting...")});
    var remove_index = get_socket_index(socket.id);

    if (remove_index > -1) {
      var disconnected_player = current_players[remove_index];
      
      // Remove player from game and sends opponent disconnect
      if (disconnected_player.game_id != null){
        let game_index = get_game_index(disconnected_player.game_id);
        let disconnecting_game = current_games[game_index];
        let player1 = disconnecting_game.player1;
        let player2 = disconnecting_game.player2;

        logger.info({message:("Disconnecting from game: " + disconnecting_game.game_id)});
        if(player1.player_id == disconnected_player.player_id){
          io.to(player2.socket_id).emit('opponent_disconnect');
          player1.game_id = null;
        } 
        else if(player2.player_id == disconnected_player.player_id){
          io.to(player1.socket_id).emit('opponent_disconnect');
          player2.game_id = null;
        }
        else {
          logger.error({message:("Error in removing player from game while disconnecting")});
        }

        // Checks if the game needs to be removed
        if (player1.game_id == null && player2.game_id == null){
          current_games.splice(game_index, 1);
          logger.info({message:("Removed a game via disconnect, current list: " + current_games)});
        }
      }

      // Remove the player from the player list
      current_players.splice(remove_index, 1);
    } 
  });

  // Listen on new_message and then sends the move to the opponent
  socket.on('players_choice', (data) => {
    var game_index = get_game_index(data.game_id);
    if (game_index >= 0){
      let player1 = current_games[game_index].player1;
      let player2 = current_games[game_index].player2;

      if (player1.player_id == data.player_id){
        io.to(player2.socket_id).emit('opponents_move', {choice: data.choice});
      } else{
        io.to(player1.socket_id).emit('opponents_move', {choice: data.choice});
      }
    } else{
      logger.info({message:("Error with game communication")});
    }
  });

  // Listens if the user wants to play against a new opponent
  socket.on('new_opponent', (data) => {
    logger.info({message:("New Opponent: User ID: " + data.player_id)});
    var player_index = get_player_index(data.player_id);
    current_players[player_index].game_id = null;

    var game_index = get_game_index(data.game_id);
    var player1 = current_games[game_index].player1;
    var player2 = current_games[game_index].player2;

    console.log("Player 1: " + player1 + ", ID: " + player1.player_id);
    console.log("Data ID: " + data.player_id);

    // Sets players refrence in game to null and sends disconnect to opponent
    if (player1.player_id == data.player_id){
      player1.game_id = null;
      if (player2.game_id != null){
        io.to(player2.socket_id).emit('opponent_disconnect');
      }
    } else{
      player2.game_id = null;
      if (player1.game_id != null){
        io.to(player1.socket_id).emit('opponent_disconnect');
      }
    }

    // If both players have left, remove the game from the list
    if (player1.game_id == null && player2.game_id == null){
      current_games.splice(game_index, 1);
      logger.info({message:("Removed a game via play_again(), current list: " + current_games)});
    }
  });

  // Listens if the player wants a rematch
  socket.on('rematch', (data) => {
    logger.info({message:("Rematch request: User ID: " + data.player_id)});
    var game_index = get_game_index(data.game_id);
    if (game_index >= 0){
      var player1 = current_games[game_index].player1;
      var player2 = current_games[game_index].player2;

      // Sets players refrence in game to null and sends disconnect to opponent
      if (player1.player_id == data.player_id){
        io.to(player2.socket_id).emit('opponent_rematch');
      } else{
        io.to(player1.socket_id).emit('opponent_rematch');
      }
    }
  });
  
  // Listens if the opponent doesn't make a move in time
  socket.on('timeout', (data) => {
    logger.info({message:("Timeout from: " + data.player_id)});
    var game_index = get_game_index(data.game_id);
    if (game_index >= 0){

      var player1 = current_games[game_index].player1;
      var player2 = current_games[game_index].player2;

      if (player1.player_id == data.player_id){
        io.to(player2.socket_id).emit('timeout_win');
      } else{
        io.to(player1.socket_id).emit('timeout_win');
      }
    }
  });

});

/*** Timed Functions that get called every 3 seconds ***/
// Checks if a game should start
function start_game(){
  // Generates a new game between two different players
  if (current_players.length > 1){
    var avaliable_players = []; 
    for (let i = 0; i < current_players.length; i++){
      if (current_players[i].game_id == null){
        avaliable_players.push(current_players[i]);
      }
    }
    if (avaliable_players.length > 1){
      var game_id = uuidv4();
      logger.info({message:("Starting New Game: " + game_id)});
      var player1 = avaliable_players[0];
      var player2 = avaliable_players[1];
      var player_start = Math.round(Math.random());

      var new_game = {game_id: game_id, player1: player1, player2: player2};
      current_games.push(new_game);

      // Updates the players to be in a game
      for (let i = 0; i < current_players.length; i++){
        if (current_players[i].player_id == player1.player_id || current_players[i].player_id == player2.player_id){
          current_players[i].game_id = game_id;
        }
      }

      if (player_start == 1){
        io.to(player1.socket_id).emit('new_game', {game_id: game_id, start_player: 1})
        io.to(player2.socket_id).emit('new_game', {game_id: game_id, start_player: 2})
      } else{
        io.to(player1.socket_id).emit('new_game', {game_id: game_id, start_player: 2})
        io.to(player2.socket_id).emit('new_game', {game_id: game_id, start_player: 1})
      }
    }
  }
}

// Sends through the number of current online players
function update_online_num(){
  io.sockets.emit('update_online_num', {online_num: current_players.length});
}


/*** Supporting functions ***/
function get_game_index(game_id){
  var game_index = -1;
  for (let i = 0; i < current_games.length; i++){
    if (current_games[i].game_id == game_id){
      game_index = i;
      break;
    }
  }
  if (game_index == -1){
    logger.error({message:("Error in getting game-index")});
  }
  return game_index;
}

function get_socket_index(socket_id){
  var player_index = -1;
  for (let i = 0; i < current_players.length; i++){
    if ((current_players[i].socket_id == socket_id) && (current_players[i].player_id != null)){
      player_index = i;
      break;
    }
  }
  return player_index;
}

function get_player_index(player_id){
  var player_index = -1;
  for (let i = 0; i < current_players.length; i++){
    if (current_players[i].player_id == player_id){
      player_index = i;
      break;
    }
  }
  return player_index;
}
