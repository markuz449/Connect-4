use crate::game::Game;
use std::io;

/// A simple player function that gets a user to enter their choice from stdin.
///
/// The input is read as a string and parsed to a usize. If it fails then the error choice function is called.
/// Otherwise it returns the player's choice.
///
/// # Example
///
/// ``` rust
/// let mut player_choice: usize = 0;
///
/// let mut input_text = String::new();
/// io::stdin().read_line(&mut input_text).expect("Failed to read from stdin");
///
/// let trimmed = input_text.trim();
/// match trimmed.parse::<usize>() {
///     Ok(choice_num) => player_choice = choice_num,
///     Err(..) => error_choice(game),
/// };
/// player_choice
/// ```
pub fn player_turn(game: &Game) -> usize {
    let mut player_choice: usize = 0;

    game.print_board();

    let mut input_text = String::new();
    io::stdin()
        .read_line(&mut input_text)
        .expect("Failed to read from stdin");

    let trimmed = input_text.trim();
    match trimmed.parse::<usize>() {
        Ok(choice_num) => player_choice = choice_num,
        Err(..) => error_choice(game),
    };
    player_choice
}

/// Error function that is called if the user did not enter a parseable usize
///
/// It just recalls the player turn function. This happens until the user enters a parseable usize.
fn error_choice(game: &Game) {
    player_turn(game);
}
