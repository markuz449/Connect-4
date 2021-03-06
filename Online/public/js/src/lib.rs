// The wasm-pack uses wasm-bindgen to build and generate JavaScript binding file.
// Import the wasm-bindgen crate.
use wasm_bindgen::prelude::*;
use game::Game;

mod game;

// Starts Connect 4
#[wasm_bindgen]
pub fn start(starting_player: usize) -> String{
    let mut game = Game::new_game();
    
    game.current_player = starting_player;
    
    let json_game = serde_json::to_string(&game).unwrap();
    return json_game
}

// Takes in the users input and stores it
#[wasm_bindgen]
pub fn players_choice(string_game: String, choice: usize) -> String{
    let mut game: Game = serde_json::from_str(&string_game).unwrap();
    
    let y_location: usize = Game::find_placement(&game, choice);
    game.update_board(choice, y_location);
    game.board_check(choice, y_location);

    let json_game = serde_json::to_string(&game).unwrap();
    return json_game
}