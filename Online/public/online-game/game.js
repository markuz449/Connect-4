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
var player_num;

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
  if (game_id != null && jsonGame.current_player == player_num){
    if(update_board(choice_num)){
      socket.emit('players_choice', {choice : choice_num, game_id: game_id});
      document.getElementById("player").innerHTML = "Opponents turn";
      console.log("I made the move: " + choice_num)
    }
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
  var current_player_display = document.getElementById("player");
  current_player_display.style.display = "none";

  var winner_text_id = "game_over_text";
  if (jsonGame.winner == -1){
    document.getElementById(winner_text_id).innerHTML = "Draw Game";
  } else if (jsonGame.winner == -2){
    document.getElementById(winner_text_id).innerHTML = "You Won via Forfeit";
  } else if (jsonGame.winner == player_num){
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
    socket.emit('play_again', {game_id: game_id, user_id: user_id});
    user_id = null;
    game_id = null;
    player_num = null;
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
  console.log("Current Player: " + jsonGame.current_player);
  console.log("Player num: " + player_num);
}

socket.on('new_player', (data) => {
  user_id = data.user_id;
});

socket.on('new_game', (data) => {
  game_id = data.game_id;
  player_num = data.start_player;
  jsonGame.current_player = 1;
  // Sets oppopnent id and sets current player
  if (data.start_player == 1){
    document.getElementById("player").innerHTML = "Your turn";
  } else{
    document.getElementById("player").innerHTML = "Opponents turn";
  }
  console.log("Game start")
  game_status();
});

socket.on('opponents_move', (data) => {
  if (data.game_id == game_id){
    if(jsonGame.current_player != player_num){
      update_board(data.choice);
      document.getElementById("player").innerHTML = "Your turn";
      console.log("Recieved opponenets move: " + data.choice);
    } /*else{
      player_swap();
      document.getElementById("player").innerHTML = "Opponents turn";
    }*/
  }
});

socket.on('disconnect', () =>{
  jsonGame.winner = -10; //This is so that the game will restart on the clients end
  restart_game();
});

socket.on('forfeit_win', () => {
  if (jsonGame.winner == 0){
    jsonGame.winner = -2;
    game_over();
  }
});