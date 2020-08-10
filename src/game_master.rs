use crate::game::Game;
use rand::Rng;

// Starts the game of Connect 4
pub fn start_game(){
    let mut game = Game::new_game();

    let mut rng = rand::thread_rng();
    let coin_flip = rng.gen_range(1,3);
    
    println!("Game Start!");
    if coin_flip == 1{
        game.current_player = 1;
    } else{
        game.current_player = 2;
    }
    game_loop(&mut game);
}

// The main game loop
pub fn game_loop(game: &mut Game){
    while game.winner == 0{
        println!("It is player {}'s turn", game.current_player);
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
            println!("Please enter a valid number");
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

    game.print_board();
    if game.current_player == 1{
        game.current_player += 1;
    } else{
        game.current_player -= 1;
    }

    if game.winner == -1{
        println!("The game is a draw");
    } else{
        println!("Player {} has won the game!", game.current_player);
    }
}

// Takes a usize and trys to convert to an i8
pub fn to_i8 (num: usize) -> Option<i8> {
    if num > std::i8::MAX as usize {
        None
    } else {
        Some(num as i8)
    }
}
