var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var {v4: uuidv4 }  = require("uuid");
var path = require("path");
var {transports, createLogger, format} = require('winston');
const { Console } = require("console");

var app = express();
var root = path.join(__dirname + "/public");

var current_players = [];
var current_games = [];
var private_join_codes = [];
var private_players = [];

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
      //new transports.Console(),
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
  logger.info({message: ("Socket: " + socket.id + " connected")});

  // Listens for when player requests a player_id
  socket.on('generate_player_id', () => {
    socket.emit('new_player_id', {player_id: uuidv4()});
  });

  // Listens for when the player connects
  socket.on('player_connect', (data) => {
    logger.info({message:('New player connected: ' + data.player_id)});
    var new_player = {socket_id: socket.id, player_id: data.player_id, game_id: null};
    current_players.push(new_player);
    logger.info({message:("Current Players: " + current_players.length)});
  });

  // Listens if a player disconnects
  // Checks if they were in a game or not, if so, tell the opponent that they forfeited
  socket.on('disconnect', () => {
    logger.info({message:("Socket: " + socket.id + " disconnecting")});
    var public_socket_index = get_socket_index(socket.id);
    var private_socket_index = get_private_socket_index(socket.id);

    // Disconnects from Public
    if (public_socket_index > -1) {
      var disconnecting_player = current_players[public_socket_index];
      
      // Remove player from game and sends opponent disconnect
      if (disconnecting_player.game_id != null){
        var game_index = get_game_index(disconnecting_player.game_id);
        var disconnecting_game = current_games[game_index];
        var player1 = disconnecting_game.player1;
        var player2 = disconnecting_game.player2;

        logger.info({message:("Disconnecting from public game: " + disconnecting_game.game_id)});
        if(player1.player_id == disconnecting_player.player_id){
          io.to(player2.socket_id).emit('opponent_disconnect');
          player1.game_id = null;
        } 
        else if(player2.player_id == disconnecting_player.player_id){
          io.to(player1.socket_id).emit('opponent_disconnect');
          player2.game_id = null;
        }
        else {
          logger.error({message:("Error in removing player from public game while disconnecting")});
        }

        // Checks if the game needs to be removed
        if (player1.game_id == null && player2.game_id == null){
          current_games.splice(game_index, 1);
          logger.info({message:("Removed a game via disconnect, current list: " + current_games)});
        }
      }

      // Remove the player from the player list
      current_players.splice(public_socket_index, 1);
    } 

    // Disconnects from Private
    if (private_socket_index > -1){
      // Check players gameId
      // If null remove them n code
      // If not, send opponent mesage
      // Remove the player but keep code
      // updateu the game player list... yu know what it is
      // If both null then remove code
      console.log("Private Players: " + private_players);
      console.log("Private Codes: " + private_join_codes);

      var disconnecting_player = private_players[private_socket_index];
      console.log("Disconnecting player: " + disconnecting_player.player_id);
      console.log("Socket 1: " + disconnecting_player.socket_id + ", Socket 2: " + socket.id);
      console.log("Game ID: " + disconnecting_player.game_id);

      if (disconnecting_player.game_id != null){
        var game_index = get_game_index(disconnecting_player.game_id);
        var disconnecting_game = current_games[game_index];
        var player1 = disconnecting_game.player1;
        var player2 = disconnecting_game.player2;

        logger.info({message:("Disconnecting from private game: " + disconnecting_game.game_id)});
        if(player1.player_id == disconnecting_player.player_id){
          io.to(player2.socket_id).emit('opponent_disconnect');
          player1.game_id = null;
        } 
        else if(player2.player_id == disconnecting_player.player_id){
          io.to(player1.socket_id).emit('opponent_disconnect');
          player2.game_id = null;
        }
        else {
          logger.error({message:("Error in removing player from public game while disconnecting")});
        }

        // Checks if the game needs to be removed and join code
        if (player1.game_id == null && player2.game_id == null){
          console.log("Private Codes: " + private_join_codes);
          console.log("Removing Game and Join Code");
          current_games.splice(game_index, 1);
          private_join_codes.splice(private_join_codes.indexOf(disconnecting_player.join_code), 1);
          logger.info({message:("Removed a game via disconnect, current list: " + current_games)});
          logger.info({message:("Removed a join code via disconnect, current list: " + private_join_codes)});
        } 
        else{
          // Adds the join code back to the list so friend can join again if accidental disconnect
          private_join_codes.push(disconnecting_player.join_code);
        }
      } 
      else{
        // Removes unused join code
        private_join_codes.splice(private_join_codes.indexOf(disconnecting_player.join_code), 1);
      }

      // Remove player from private list
      private_players.splice(private_socket_index, 1);

      console.log("Private Players: " + private_players);
      console.log("Private Codes: " + private_join_codes);
    }
  });

  // Listen on new_message and then sends the move to the opponent
  socket.on('players_choice', (data) => {
    var game_index = get_game_index(data.game_id);
    if (game_index >= 0){
      var player1 = current_games[game_index].player1;
      var player2 = current_games[game_index].player2;

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
    logger.info({message:("New Opponent: Player ID: " + data.player_id)});
    var player_index = get_player_index(data.player_id);
    current_players[player_index].game_id = null;

    var game_index = get_game_index(data.game_id);
    var player1 = current_games[game_index].player1;
    var player2 = current_games[game_index].player2;

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
    logger.info({message:("Rematch request: Player ID: " + data.player_id)});
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

  // Listens if user wants to host a private game
  socket.on('host_game', (data) => {
    logger.info({message: "Player: " + data.player_id + " Hosting Game"});
    var join_code = uuidv4();
    join_code = join_code.substring(0, 5);
    private_join_codes.push(join_code);

    var private_player = {socket_id: socket.id, player_id: data.player_id, join_code: join_code, game_id: null};
    private_players.push(private_player);
    
    console.log("Join Code List: " + private_join_codes);
    socket.emit("send_join_code", {join_code: join_code});
  });

  // Listens for a user wanting to join a private game
  socket.on('check_join_code', (data) => {
    logger.info({message: "Joining player via join code: " + data.join_code});
    if (private_join_codes.includes(data.join_code)){
      socket.emit("accepted_join_code");
    } else{
      socket.emit("rejected_join_code");
    }
  });

  socket.on('start_private_game', (data) => {
    var game_id = uuidv4();
    var join_code = data.join_code;
    logger.info({message:("Starting New Private Game: " + game_id)});

    // Creates the two players
    var host_player = private_players.find(private_player => private_player.join_code === join_code);
    var join_player = {socket_id: socket.id, player_id: data.player_id, join_code: join_code, game_id: null};
    private_players.push(join_player);

    // Removes Join code from list so a third person can't join
    private_join_codes.splice(private_join_codes.indexOf(join_code), 1);
    console.log("Private Join Codes: " + private_join_codes);
    
    console.log("Private Players: " + private_players);
    host_player.game_id = game_id;
    join_player.game_id = game_id;

    // Create Game instance for both players
    var player_start = Math.round(Math.random());
    var new_game = {game_id: game_id, player1: host_player, player2: join_player};
    current_games.push(new_game);

    if (player_start == 1){
      io.to(host_player.socket_id).emit('new_game', {game_id: game_id, start_player: 1})
      io.to(join_player.socket_id).emit('new_game', {game_id: game_id, start_player: 2})
    } else{
      io.to(host_player.socket_id).emit('new_game', {game_id: game_id, start_player: 2})
      io.to(join_player.socket_id).emit('new_game', {game_id: game_id, start_player: 1})
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
      logger.info({message:("Starting New Public Game: " + game_id)});
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

// Gets the games index from a given Game ID
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

// Gets the public players index from a given Socket ID
function get_socket_index(socket_id){
  var socket_index = -1;
  for (let i = 0; i < current_players.length; i++){
    if ((current_players[i].socket_id == socket_id) && (current_players[i].player_id != null)){
      socket_index = i;
      break;
    }
  }
  return socket_index;
}

// Gets the public players index from a given Player ID
function get_player_index(player_id){
  var player_index = -1;
  for (let i = 0; i < current_players.length; i++){
    if (current_players[i].player_id == player_id){
      player_index = i;
      break;
    }
  }
  if (player_index == -1){
    logger.error({message:("Error in getting player-index")});
  }
  return player_index;
}

// Gets the private players index from a given Socket ID
function get_private_socket_index(socket_id){
  var socket_index = -1;
  for (let i = 0; i < private_players.length; i++){
    if ((private_players[i].socket_id == socket_id)){
      socket_index = i;
      break;
    }
  }
  return socket_index;
}

function join_code_num(join_code){
  var code_num = 0;
  for (let i = 0; i < private_players.length; i++){
    if (private_players[i].join_code == join_code){
      code_num++;
    }
  }
  return code_num;
}