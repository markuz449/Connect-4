use crate::game::Game;
use rand::Rng;

/// Starts the game of Connect 4
/// 
/// This function creates a new instance of the game.
/// There is a coin flip to decide which player starts first.
/// Then the game loop is called and the game starts.
/// 
/// #Examples
/// ``` rust
/// use crate::game::Game;
/// let mut game = new Game::new_game();
/// 
/// game_loop(&mut game);
/// ```
/// 
pub fn start_game(){
    let mut game = Game::new_game();

    let mut rng = rand::thread_rng();
    let coin_flip = rng.gen_range(1,3);
    
    if coin_flip == 1{
        game.current_player = 1;
    } else{
        game.current_player = 2;
    }
    game_loop(&mut game);
}

/// This function is the main game loop of Connect 4
/// 
/// The game loops forever until there is a winner.
/// This is done by checking the winner variable in the game struct
/// 
/// # Example
/// 
/// ``` rust
/// while game.winner == 0{
/// 
/// }
/// ```
/// The player then makes their move.
/// The program calls the individual move function of the player.
/// After the player has made their move the validity checker is called in the Game crate.
/// 
/// # Example
/// 
/// ``` rust
/// let mut choice_num;
/// let player_choice: fn(&Game) -> usize;
/// 
/// player_choice = game.player1;
/// choice_num = player_choice(game);
/// 
/// while Game::valid_check(game, choice_num) == false{
/// choice_num = player_choice(game);
/// } 
/// ```
/// 
/// Once the player has made a valid move the board is updated with their move
/// 
/// And then the board is checked to see if the game is won
/// 
/// # Example
/// 
/// ``` rust
/// game.update_board(choice_num, y_position);
/// game.board_check(choice_num, y_position);
/// ```
/// The current player changes and then the game is checked again to see if it is over
/// 
/// Then the game winner inside the game struct is checked to see who the winner is.
/// 
/// If the result was -1 then the game was a draw, 
/// otherwise the number corresponding to the player is the winner.
fn game_loop(game: &mut Game){
    while game.winner == 0{
        let mut choice_num;
        let player_choice: fn(&Game) -> usize;
        if game.current_player == 1{
            player_choice = game.player1;
            choice_num = player_choice(game);
        } else{
            player_choice = game.player2;
            choice_num = player_choice(game);
        }
        while Game::valid_check(game, choice_num) == false{
            choice_num = player_choice(game);
        } 
        choice_num -= 1;
        let y_position = Game::find_placement(game, choice_num);

        game.update_board(choice_num, y_position);
        game.board_check(choice_num, y_position);

        if game.current_player == 1{
            game.current_player += 1;
        } else{
            game.current_player -= 1;
        }
    }

    if game.current_player == 1{
        game.current_player += 1;
    } else{
        game.current_player -= 1;
    }
    game.print_board();

    if game.winner == -1{
        println!("The game is a draw");
    } else{
        println!("Player {} has won the game!", game.current_player);
    }
}

