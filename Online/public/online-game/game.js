// Import our outputted wasm ES6 module
// Which, export default's, an initialization function
import wasmInit, {
  start,
  players_choice
} from "./pkg/Connect4.js";

var jsonGame;
var stringGame;

// Create Connection to server
var socket = io.connect('/');
var user_id;
var game_id;
var player_num;
var move_time_limit = 12;
var timeouts = [];

const runWasm = async () => {
  // Instantiate our wasm module
  const rustWasm = await wasmInit("./pkg/Connect4_bg.wasm");

  stringGame = start();
  jsonGame = JSON.parse(stringGame);
  document.getElementById("current_player").innerHTML = "Searching for opponent..."
};
runWasm();


/********** Game Functions -- Private **********/

// Sends the players move to the server if it is their turn
function players_move(choice_num){
  if (game_id != null && jsonGame.current_player == player_num){
    if(update_board(choice_num)){
      socket.emit('players_choice', {choice : choice_num, game_id: game_id});
      document.getElementById("current_player").innerHTML = "Opponents turn";
      document.getElementById("timer").classList.add("invis");
      clear_timeouts();
    }
  }
}

function update_board(choice_num){
  var col_index = 6;
  var placement = 6 * col_index + choice_num;
  for (col_index; col_index > 0; col_index--){
    let id_check = "board_" + placement;

    if (document.getElementById(id_check).className == "dot"){
      if (jsonGame.current_player == 1){
        document.getElementById(id_check).classList.add("red-dot");      
      } else{
        document.getElementById(id_check).classList.add("yellow-dot");
      }
      break;
    } else{
      placement -= 7;
    }
  }
  if (placement > 0){
    stringGame = players_choice(JSON.stringify(jsonGame), choice_num);
    jsonGame = JSON.parse(stringGame);
    if (jsonGame.winner != 0){
      game_over();
    } else{
      player_swap();
    }
    return true;
  } else{
    return false;
  }
}

// Swaps who the current player is
function player_swap(){
  if (jsonGame.current_player == 1){
    jsonGame.current_player += 1;
  } else{
    jsonGame.current_player -= 1;
  }
}

// Displays who the winner is
function game_over(){
  console.log("Game Over");
  clear_timeouts();
  var winner_text_id = "game_over_text";
  if (jsonGame.winner == -1){
    document.getElementById(winner_text_id).innerHTML = "Draw Game";
  } else if (jsonGame.winner == -2){
    document.getElementById(winner_text_id).innerHTML = "You Won via Forfeit";
  } else if (jsonGame.winner == -3){
    document.getElementById(winner_text_id).innerHTML = "You Won via Timeout";
  } else if (jsonGame.winner == -4){
    document.getElementById(winner_text_id).innerHTML = "You Lost via Timeout";
  } else if (jsonGame.winner == player_num){
    document.getElementById(winner_text_id).innerHTML = "You Won";
  } else{
    document.getElementById(winner_text_id).innerHTML = "Your Opponent Won";
  }

  document.getElementById("player_info").classList.add("invis");
  document.getElementById("game_over").classList.remove("invis");
  document.getElementById("play_again").classList.remove("invis");
}

// Resets the game and starts again
function restart_game(){
  if (jsonGame != null){
    if (jsonGame.winner != null){
      if (jsonGame.winner != 0){
        socket.emit('play_again', {game_id: game_id, user_id: user_id});

        document.getElementById("player_info").classList.remove("invis");
        document.getElementById("timer").classList.add("invis");
        document.getElementById("game_over").classList.add("invis");
        document.getElementById("play_again").classList.add("invis");

        clear_game();
        runWasm();
      }      
    } else{
      console.log("There is a game in progress...");
    }
  }
}

// Clears the game
function clear_game(){
  game_id = null;
  player_num = null;

  for (let clear_board = 1; clear_board <= 42; clear_board++){
    let id_check = "board_" + clear_board;
    document.getElementById(id_check).className = "dot";
  }
}

// Handles how much time a user has to make their move
function move_timer(){
  var timer = document.getElementById("timer");
  var seconds_elapsed = 1000;
  for (let time = move_time_limit; time >= 0; time--){
    timeouts.push(setTimeout(function(){timer.innerHTML = time }, seconds_elapsed));
    seconds_elapsed += 1000;
  }

  timeouts.push(setTimeout(player_timeout, ((1000 * move_time_limit) + 1000)));
}

function player_timeout(){
  if (jsonGame.winner == 0){
    socket.emit('timeout', {user_id: user_id, game_id: game_id});
    jsonGame.winner = -4;
    game_over();
  }
}

function clear_timeouts(){
  for (let i = 0; i < timeouts.length; i++) {
    clearTimeout(timeouts[i]);
  }
  while (timeouts.length) {
    timeouts.pop();
  }
}

// Prints athe status of the game 
function game_status(){
  console.log("Game Status:");
  console.log("User ID: " + user_id);
  console.log("Current Game: " + game_id);
  console.log("Current Player: " + jsonGame.current_player);
  console.log("Player num: " + player_num);
}


/********** Window interactions -- public**********/

// Takes the users input and grabs the column number as their move
window.move = (column_num) => {
  let choice_num = parseInt(column_num.getAttribute("data-column"));
  players_move(choice_num);
}

window.play_again = () => {
  restart_game();
}


/********** Socket functions -- Interactions with the server **********/

socket.on('new_player', (data) => {
  restart_game();
  user_id = data.user_id;
});

socket.on('new_game', (data) => {
  game_id = data.game_id;
  player_num = data.start_player;
  jsonGame.current_player = 1;
  // Sets oppopnent id and sets current player
  if (data.start_player == 1){
    document.getElementById("current_player").innerHTML = "Your turn";
    document.getElementById("timer").innerHTML = move_time_limit;
    document.getElementById("timer").classList.remove("invis");
    move_timer();
  } else{
    document.getElementById("current_player").innerHTML = "Opponents turn";
    document.getElementById("timer").classList.add("invis");
  }
  console.log("Game start");
  game_status();
});

socket.on('opponents_move', (data) => {
  if (data.game_id == game_id){
    if(jsonGame.current_player != player_num){
      update_board(data.choice);
      if (jsonGame.winner == 0){
        document.getElementById("current_player").innerHTML = "Your turn";
        document.getElementById("timer").innerHTML = move_time_limit;
        document.getElementById("timer").classList.remove("invis");
        move_timer();
      }
    }
  }
});

socket.on('forfeit_win', () => {
  if (jsonGame.winner == 0){
    jsonGame.winner = -2;
    game_over();
  }
});

socket.on('timeout_win', () => {
  if (jsonGame.winner == 0){
    jsonGame.winner = -3;
    game_over();
  }
});