use crate::game::Game;
use std::io;

// Takes input from the players turn
pub fn player_turn(game: &Game) -> usize{
    let mut player_choice: usize = 0;
    
    game.print_board();
    println!("=============");
    println!("1 2 3 4 5 6 7");
    println!("Press the number corresponding to the column to place your token");
    
    let mut input_text = String::new();
    io::stdin().read_line(&mut input_text).expect("Failed to read from stdin");

    let trimmed = input_text.trim();
    match trimmed.parse::<usize>() {
        Ok(choice_num) => player_choice = choice_num,
        Err(..) => error_choice(game),
    };
    player_choice
}

// Error code if the user enetered a value that is not valid
fn error_choice(game: &Game){
    println!("This is not a valid option");
    println!("Please enter a valid option");
    player_turn(game);
}