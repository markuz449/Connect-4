use crate::game_master;

pub struct Game{
    pub board: Vec<Vec<usize>>,
    pub winner: i8, // 0:Game not won, 1:Game Won Player 1, 2:Game Won Player 2, -1: Game Drawn 
    pub current_player: usize
}

impl Game{
    // Creates a new instance of the Game
    pub fn new_game() -> Game{
        let board = vec![vec![0; 6]; 7];
        let winner: i8 = 0;
        let current_player: usize = 1;
        let game = Game {board, winner, current_player};
        game
    }

    // Checks if a given move is a valid move
    pub fn valid_check(game: &Game, player_choice: usize) -> bool{
        1 <= player_choice && player_choice < (game.board.len() + 1) && game.board[player_choice - 1][0] == 0
    }
    
    // Returns the y value for placement
    pub fn find_placement(game: &Game, valid_choice: usize) -> usize{
        let mut y_placement: usize = 0;
        for find_spot in (0..6).rev(){
            if game.board[valid_choice][find_spot] == 0{
                y_placement = find_spot;
                break;
            }
        }
        y_placement
    }
    
    // Takes in a move made by a player and updates the board
    pub fn update_board(&mut self, player_choice: usize, y_position: usize){
        self.board[player_choice][y_position] = self.current_player;
    }

    // Checks the board to see if the game has been won
    pub fn board_check(&mut self, player_choice: usize, y_position: usize){
        let mut horizCount: i8 = 0;
        let mut vertiCount: i8 = 0;
        let mut diagCount1: i8 = 0;
        let mut diagCount2: i8 = 0;
        
        horizCount = horizCount + Game::token_count(&self, player_choice, y_position, 1,  0,  0);
        horizCount = horizCount + Game::token_count(&self, player_choice, y_position, -1,  0, -1);
        vertiCount = vertiCount + Game::token_count(&self, player_choice, y_position,  0,  1,  0);
        vertiCount = vertiCount + Game::token_count(&self, player_choice, y_position,  0, -1, -1);
        diagCount1 = diagCount1 + Game::token_count(&self, player_choice, y_position, -1,  1,  0);
        diagCount1 = diagCount1 + Game::token_count(&self, player_choice, y_position,  1, -1, -1);
        diagCount2 = diagCount2 + Game::token_count(&self, player_choice, y_position, -1, -1, -1);
        
        // Checks to see if player has beaten the game
        if horizCount >= 4 || vertiCount >= 4 || diagCount1 >= 4 || diagCount2 >= 4{
            let check = game_master::to_i8(self.current_player);
            match check {
                Some(x) => self.winner = x,
                None => Game::what_the_fuck(),
            }
        }
        
        // Checks if the game is a draw
        let mut draw: i8 = 0;
        for full in 0..7{
            if self.board[full][0] != 0{
                draw += 1;
            }
        }
        if draw == 7{
            self.winner = -1;
        }
    }

    // Recursize function to check total amount in a line, from latest token played
    pub fn token_count(&self, mut posX: usize, mut posY: usize, xPosChange: i8, yPosChange: i8, mut count: i8) -> i8{
        //Player Check
        if self.board[posX][posY] != self.current_player {
            return count;
        }
        
        //Boundary Checks
        let xBoundCheck = posX as i8;
        let yBoundCheck = posY as i8;
        if (xBoundCheck + xPosChange < 0 || yBoundCheck + yPosChange < 0) || (xBoundCheck + xPosChange >= 7 || yBoundCheck + yPosChange >= 6) {
            count += 1;
            return count;
        }
        
        posX = Game::update_position(posX, xPosChange);
        posY = Game::update_position(posY, yPosChange);
        count += 1;
        Game::token_count(self, posX, posY, xPosChange, yPosChange, count)
    }

    // This gets given an old usize position and updates it with an i8
    pub fn update_position(mut position: usize, change: i8) -> usize{
        let mut updater: i8 = 0;
        let result = game_master::to_i8(position);
        match result {
            Some(x) => updater = x,
            None => Game::what_the_fuck(),
        }
        updater += change;
        position = updater as usize;
        position
    }

    // Prints out the current board of Connect 4
    pub fn print_board(&self){
        println!("Current Board:");
        for y_print in 0..6{
            for x_print in 0..7{
                if self.board[x_print][y_print] == 1{
                    print!("X ");
                } else if self.board[x_print][y_print] == 2{
                    print!("O ");
                } else{
                    print!("- ");
                }
            }
            println!();
        }
    }

    // Very important function, the most important in the entire program
    pub fn what_the_fuck(){
        println!("What did you do to end up here...");
        println!("Seriously, what the fuck!?");
        println!("Good job detective, start over you piece of shit");
        std::process::exit(0);
    }
}

#[cfg(test)]
mod tests{
    use crate::game::Game;
    
    #[test]
    fn new_game_test(){
        let _game = Game::new_game();
        assert_eq!(_game.winner, 0);
    }

    #[test]
    fn update_board_test(){
        let mut _game = Game::new_game();
        println!("Pre Update:");
        Game::print_board(&_game);
        _game.update_board(5, 5);
        println!("Post Update:");
        Game::print_board(&_game);
        assert_eq!(_game.board[5][5], 1);
    }

    #[test]
    fn test_valid_check(){
        let mut _game = Game::new_game();
        let check = Game::valid_check(&_game, 6);
        assert_eq!(check, true);
    }

    #[test]
    fn test_valid_check_lower_bound(){
        let mut _game = Game::new_game();
        let check = Game::valid_check(&_game, 0);
        assert_eq!(check, false);
    }

    #[test]
    fn test_valid_check_upper_bound(){
        let mut _game = Game::new_game();
        let check = Game::valid_check(&_game, 7);
        assert_eq!(check, true);
    }

    #[test]
    fn test_find_placement(){
        let mut _game = Game::new_game();
        let yPos= Game::find_placement(&_game, 6);
        assert_eq!(yPos, 5);
    }

    #[test]
    fn check_board_won(){
        let mut _game = Game::new_game();
        _game.update_board(5, 5);
        _game.update_board(5, 4);
        _game.update_board(5, 3);
        _game.update_board(5, 2);
        _game.board_check(5, 2);
        println!("Won Game:");
        Game::print_board(&_game);
        assert_eq!(_game.winner, 1);
    }
    #[test]
    fn check_board_loop(){
        let mut _game = Game::new_game();
        _game.update_board(5, 4);
        _game.update_board(5, 3);
        _game.update_board(5, 2);
        _game.board_check(5, 2);
        println!("In Progress Game:");
        Game::print_board(&_game);
        assert_eq!(_game.winner, 0);
    }
    #[test]
    fn check_board_draw(){
        let mut _game = Game::new_game();
        let mut test_player: usize;
        let mut count = 2;
        for row in 0..7{
            if count != 0{
                test_player = 1;
                count -= 1;
            } else{
                count = 2;
                test_player = 2;
            }
            for col in 0..6{
                _game.board[row][col] = test_player;
                _game.board_check(row, col);
                if test_player != 2{
                    test_player += 1;
                } else{
                    test_player -= 1;
                }
            }
        }
        println!("Draw Game:");
        Game::print_board(&_game);
        assert_eq!(_game.winner, -1);
    }
}