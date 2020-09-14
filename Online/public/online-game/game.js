// Import our outputted wasm ES6 module
// Which, export default's, an initialization function
import wasmInit, {
  start,
  players_choice
} from "./pkg/Connect4.js";

let jsonGame;
let stringGame;

// Create Connection to server
var socket = io.connect('/');
var user_id;
var game_id;
var my_move;

const runWasm = async () => {
  // Instantiate our wasm module
  const rustWasm = await wasmInit("./pkg/Connect4_bg.wasm");

  stringGame = start();
  jsonGame = JSON.parse(stringGame);
  document.getElementById("player").innerHTML = "Saerching for opponent..."
};
runWasm();

// Sends the players move to the server if it is their turn
function players_move(choice_num){
  if (game_id != null && my_move == true){
    
    socket.emit('players_choice', {choice : choice_num, game_id: game_id});
    update_board(choice_num);
  }
}

function update_board(choice_num){
  let col_index = 6;
  let placement = 6 * col_index + choice_num;
  for (col_index; col_index > 0; col_index--){
    let id_check = "board_" + placement;

    if (document.getElementById(id_check).className == "dot"){
      if (jsonGame.current_player == 1){
        document.getElementById(id_check).className = "red-dot";
      } else{
        document.getElementById(id_check).className = "yellow-dot";
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
  var current_player_display = document.getElementById("player");
  current_player_display.style.display = "none";

  var winner_text_id = "game_over_text";
  if (jsonGame.winner == -1){
    document.getElementById(winner_text_id).innerHTML = "Draw Game";
  } else if (my_move == true){
    document.getElementById(winner_text_id).innerHTML = "You Won";
  } else{
    document.getElementById(winner_text_id).innerHTML = "Your Opponent Won";
  }
  var game_over_display = document.getElementById("game_over");
  game_over_display.style.display = "block";

  var play_button = document.getElementById("play_again");
  play_button.style.display = "block";
}

// Resets the game and starts again
function restart_game(){
  if(jsonGame.winner != 0){
    var current_player_display = document.getElementById("player");
    current_player_display.style.display = "block";

    var game_over_display = document.getElementById("game_over");
    game_over_display.style.display = "none";

    var play_button = document.getElementById("play_again");
    play_button.style.display = "none";

    let clear_board = 1;
    for (clear_board; clear_board <= 42; clear_board++){
      let id_check = "board_" + clear_board;
      document.getElementById(id_check).className = "dot";
    }
    runWasm();
  } else{
    console.log("There is a game in progress...");
  }
}

// Takes the users input and grabs the column number as their move
window.move = (column_num) => {
  let choice_num = parseInt(column_num.getAttribute("data-column"));
  players_move(choice_num);
}

window.play_again = () => {
  restart_game();
}

function game_status(){
  console.log("Game Status:");
  console.log("User ID: " + user_id);
  console.log("Current Game: " + game_id);
  console.log("My move? " + my_move);
}

socket.on('new_player', (data) => {
  user_id = data.user_id;
});

socket.on('new_game', (data) => {
  game_id = data.game_id;

  // Sets oppopnent id and sets current player
  if (data.start_player == true){
    my_move = true;
    document.getElementById("player").innerHTML = "Your turn";
  } else{
    my_move = false;
    document.getElementById("player").innerHTML = "Opponents turn";
  }
  game_status();
});

socket.on('players_move', (data) => {
  if (data.game_id == game_id){
    if(my_move == false){
      update_board(data.choice);
      my_move = true;
      document.getElementById("player").innerHTML = "Your turn";
      game_status();
    } else{
      my_move = false;
      document.getElementById("player").innerHTML = "Opponents turn";
    }
  }
});