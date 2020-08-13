#![allow(non_snake_case)]

//! Welcome to Rust Connect 4!
//! 
//! This is the simple game of Connect 4 but in the programming language rust

/// Controls the game and interactions of the players
mod game_master;
/// Holds all of the important information of game and many supporting functions
mod game;
/// A simle class that allows a person to play this game of Connect 4
mod player;

/// The main method for starting Connect 4
/// 
/// This is done by calling game master's start game method
fn main() {
    game_master::start_game();
}
