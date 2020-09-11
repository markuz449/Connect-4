// Import our outputted wasm ES6 module
// Which, export default's, an initialization function
import wasmInit, {
  start,
  players_choice
} from "./pkg/Connect4.js";

let jsonGame;
let stringGame;

// Create Connection to server
var socket = io.connect('http://localhost:6969');
var user_id;

const runWasm = async () => {
  // Instantiate our wasm module
  const rustWasm = await wasmInit("./pkg/Connect4_bg.wasm");

  stringGame = start();
  jsonGame = JSON.parse(stringGame);
  document.getElementById("player").innerHTML = "Current Player: " + jsonGame.current_player;
};
runWasm();

// The new player function
function update(choice_num){
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
  document.getElementById("player").innerHTML = "Current Player: " + jsonGame.current_player;
}

// Displays who the winner is
function game_over(){

  var winner_text_id = "game_over_text";
  if (jsonGame.winner == 1){
    document.getElementById(winner_text_id).innerHTML = "Player 1 Wins";
  } else if (jsonGame.winner == 2){
    document.getElementById(winner_text_id).innerHTML = "Player 2 Wins";
  } else{
    document.getElementById(winner_text_id).innerHTML = "Draw Game";
  }
  var game_over_display = document.getElementById("game_over");
  game_over_display.style.display = "block";

  var play_button = document.getElementById("play_again");
  play_button.style.display = "block";
}

// Resets the game and starts again
function restart_game(){
  if(jsonGame.winner != 0){
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

// Buttons used for player input
// Represents the slots of the game board
window.choice_1 = () => {
  socket.emit('players_choice', {choice : 0});
  update(0);
}
window.choice_2 = () => {
  socket.emit('players_choice', {choice : 1});
  update(1);
}
window.choice_3 = () => {
  socket.emit('players_choice', {choice : 2});
  update(2);
}
window.choice_4 = () => {
  socket.emit('players_choice', {choice : 3});
  update(3);
}
window.choice_5 = () => {
  socket.emit('players_choice', {choice : 4});
  update(4);
}
window.choice_6 = () => {
  socket.emit('players_choice', {choice : 5});
  update(5);
}
window.choice_7 = () => {
  socket.emit('players_choice', {choice : 6});
  update(6);
}

window.play_again = () => {
  restart_game();
}

socket.on('new_player', (data) => {
  user_id = data.user_id;
  console.log(user_id);
});
