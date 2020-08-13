use crate::player;

/// This is the main structure of the game. 
/// The game struct holds all of the important data that the game needs.
/// The structure holds the current board, the winner status, who the current player is, and, 
/// the refreneces to the player's choice function.
/// 
/// 
pub struct Game{
    pub board: Vec<Vec<usize>>,
    pub winner: i8, 
    /// Winner can hold: 
    /// 
    ///   0 -> Game is not over
    /// 
    ///   1 -> Game won by Player 1
    /// 
    ///   2 -> Game won by Player 2
    /// 
    ///  -1 -> Game is a drawn
    pub current_player: usize,
    pub player1: fn(&Game) -> usize,
    pub player2: fn(&Game) -> usize
}

impl Game{
    /// Creates a new instance of the Game
    /// 
    /// To create a new game you first need to set all of the base data like the size of the board.
    /// Here we are setting the size to be 7 x 6, the standard size of Connect 4. 
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// let board = vec![vec![0; 6]; 7];
    /// let winner: i8 = 0;
    /// let current_player: usize = 1;
    /// ```
    /// Next we need to set the players choice functions. 
    /// These particular functions must take in an instance of the Game and return a usize. 
    /// The point of setting these is so that you can change how the player interacts with game,
    /// for example you could create an AI to play the game. 
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// let player1 = player::player_turn;
    /// let player2 = AI::AI_turn;
    /// ```
    /// 
    /// Fnally the game is created and returned
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// let game = Game {board, winner, current_player, player1, player2};
    /// game
    /// ```
    /// 
    /// 
    pub fn new_game() -> Game{
        let board = vec![vec![0; 6]; 7];
        let winner: i8 = 0;
        let current_player: usize = 1;

        /* Here you can set a refrence to whatever player class you want
        *  Make sure that whatever function you set it returns a usize and takes an instance of game
        */
        let player1 = player::player_turn;
        let player2 = player::player_turn;
        let game = Game {board, winner, current_player, player1, player2};
        game
    }

    /// Checks if a given move is a valid move. 
    /// This function checks the bounds of the move and if the column is fre for placement4
    /// 
    /// 
    pub fn valid_check(game: &Game, player_choice: usize) -> bool{
        1 <= player_choice && player_choice < (game.board.len() + 1) && game.board[player_choice - 1][0] == 0
    }
    
    /// Returns the y value for placement
    /// 
    /// # Panics
    /// 
    /// The game will panic here if the column size is smaller than 6 
    /// and the game will break if the column size is greater than 6
    /// 
    /// 
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
    
    /// Takes in a move made by a player and updates the board
    /// 
    /// 
    pub fn update_board(&mut self, player_choice: usize, y_position: usize){
        self.board[player_choice][y_position] = self.current_player;
    }

    /// Checks the board to see if the game is over
    /// 
    /// This function checks the to see if any of the players have made connected 4 tokens. 
    /// The function does this by checking each line of the last played piece. 
    /// It calls the token counting function checking both directions. 
    /// 
    /// For example the function counts both left and right and adds the totals together. 
    /// If the cound is greater than 4 then the player has won
    /// 
    /// # Example 
    /// 
    /// ``` rust
    /// horizCount = horizCount + Game::token_count(&self, player_choice, y_position,  1,  0,  0);
    /// horizCount = horizCount + Game::token_count(&self, player_choice, y_position, -1,  0, -1);
    /// 
    /// if horizCount >= 4{
    ///     self.winner = game_master::to_i8(self.current_player);
    /// }
    /// ```
    /// 
    /// This function ckecks horizontal, vertical, and, both diagonal directions
    /// 
    /// If no player has won then the program also checks the top row of the game to see if they are filled. 
    /// If so, then the game is a draw. 
    /// 
    /// # Panics
    /// 
    /// The game will panic here if the row size is smaller than 7 
    /// and the game will break if the row size is greater than 7
    /// 
    /// 
    pub fn board_check(&mut self, player_choice: usize, y_position: usize){
        let mut horizCount: i8 = 0;
        let mut vertiCount: i8 = 0;
        let mut diagCount1: i8 = 0;
        let mut diagCount2: i8 = 0;
        
        horizCount = horizCount + Game::token_count(&self, player_choice, y_position,  1,  0,  0);
        horizCount = horizCount + Game::token_count(&self, player_choice, y_position, -1,  0, -1);
        vertiCount = vertiCount + Game::token_count(&self, player_choice, y_position,  0,  1,  0);
        vertiCount = vertiCount + Game::token_count(&self, player_choice, y_position,  0, -1, -1);
        diagCount1 = diagCount1 + Game::token_count(&self, player_choice, y_position, -1,  1,  0);
        diagCount1 = diagCount1 + Game::token_count(&self, player_choice, y_position,  1, -1, -1);
        diagCount2 = diagCount2 + Game::token_count(&self, player_choice, y_position,  1,  1,  0);
        diagCount2 = diagCount2 + Game::token_count(&self, player_choice, y_position, -1, -1, -1);
        
        // Checks to see if player has beaten the game
        if horizCount >= 4 || vertiCount >= 4 || diagCount1 >= 4 || diagCount2 >= 4{
            self.winner = Game::to_i8(self.current_player);
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

    /// Recursive function that counts the total amount of tokens in a given line. 
    /// 
    /// This recursize function has a lot of changing variables that are important. 
    /// 
    /// # Arguements
    /// 
    /// ``` rust
    /// posX;       // This is current x position that is being checked
    /// posY;       // This is current y position that is being checked
    /// xPosChange; // This is a singular number which tells the direction of change on the x axis: 1 for right, -1 for left, 0 for no change
    /// yPosChange; // This is a singular number which tells the direction of change on the y axis: 1 for up, -1 for down, 0 for no change
    /// count;      // This is the total count of the tokens
    /// ```
    /// 
    /// The function first checks to see if the token is the same as the players
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// if self.board[posX][posY] != self.current_player {
    ///     return count;
    /// }
    /// ```
    /// 
    /// Then it checks if it is on the edge of the board. 
    /// If it is then it adds one to the total count and returns. 
    /// 
    /// For example if the current token was on the far left
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// let xBoundCheck: i8 = posX as i8;
    /// if (xBoundCheck + xPosChange < 0){
    ///     return count += 1;
    /// }
    /// ```
    /// 
    /// Finally if both cases above were false the positions are updated and the function is ran again. 
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// posX = Game::update_position(posX, xPosChange);
    /// posY = Game::update_position(posY, yPosChange);
    /// count += 1;
    /// Game::token_count(self, posX, posY, xPosChange, yPosChange, count)
    /// ```
    /// 
    /// 
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

    /// This function updates the next position that is going to be checked by the token count function
    /// 
    /// # Example
    /// 
    /// ``` rust
    /// position += change;
    /// return position
    /// ```
    ///  
    /// This function also does the type conversion that is needed to update the usize position. 
    /// This is required because a usize cannot hold a negative value
    /// 
    /// 
    pub fn update_position(mut position: usize, change: i8) -> usize{
        let mut updater = Game::to_i8(position);
        updater += change;
        position = updater as usize;
        position
    }

    /// A simple function that converts a usize into an i8
    /// 
    /// This function only works for values of usize that are smaller than or equal to the max value of i8.
    /// If the max value of i8 is exceeded then the function returns 0.
    /// 
    /// 
    pub fn to_i8 (num: usize) -> i8 {
        let mut conversion: i8 = 0;
        let result = Game::to_Option_i8(num);
        match result {
            Some(x) => conversion = x,
            None => println!("The value entered exceeds size of i8"),
        }
        return conversion
    }

    /// This is a supporter function for to_i8. 
    /// 
    /// It converts a usize into an Option<i8> which will be converted into a base i8
    /// 
    /// 
    fn to_Option_i8(num: usize) -> Option<i8>{
        if num > std::i8::MAX as usize {
            None
        } else {
            Some(num as i8)
        }
    }

    /// Prints out the current board of Connect 4 to the terminal
    /// 
    /// This is the default print statement for the game however a player class could create their own. 
    /// 
    /// 
    pub fn print_board(&self){
        print!("\x1bc");
        println!("{}     {}", "\x1b[m", "Connect 4");
        println!("\x1b[m");
        if self.current_player == 1{
            println!("   -> {}Player 1{}", "\x1b[1;31m", "\x1b[m");
            println!("      {}Player 2{}", "\x1b[1;33m", "\x1b[m");
        } else {
            println!("      {}Player 1{}", "\x1b[1;31m", "\x1b[m");
            println!("   -> {}Player 2{}", "\x1b[1;33m", "\x1b[m");
        }
        println!();
        println!("   Current Board:");
        for y_print in 0..6{
            print!("   ");
            for x_print in 0..7{
                if self.board[x_print][y_print] == 1{
                    print!("{}X ", "\x1b[1;31m");
                } else if self.board[x_print][y_print] == 2{
                    print!("{}O ", "\x1b[1;33m");
                } else{
                    print!("{}· ", "\x1b[m");
                }
            }
            println!();
        }
        print!("\x1b[m");
        println!("   =============");
        println!("   1 2 3 4 5 6 7");
        println!("Press the number corresponding to the column to place your token");
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
    fn check_board_won_vertical(){
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
    fn check_board_won_horizontal(){
        let mut _game = Game::new_game();
        _game.update_board(1, 5);
        _game.update_board(2, 5);
        _game.update_board(3, 5);
        _game.update_board(4, 5);
        _game.board_check(4, 5);
        println!("Won Game:");
        Game::print_board(&_game);
        assert_eq!(_game.winner, 1);
    }

    #[test]
    fn check_board_won_diagonal(){
        let mut _game = Game::new_game();
        _game.update_board(5, 5);
        _game.update_board(4, 4);
        _game.update_board(3, 3);
        _game.update_board(2, 2);
        _game.board_check(2, 2);
        println!("Won Game:");
        Game::print_board(&_game);
        assert_eq!(_game.winner, 1);
    }

    #[test]
    fn check_board_won_diagonal_2_electric_boogaloo(){
        let mut _game = Game::new_game();
        _game.update_board(5, 2);
        _game.update_board(4, 3);
        _game.update_board(3, 4);
        _game.update_board(2, 5);
        _game.board_check(2, 5);
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

    #[test]
    fn test_to_i8_small(){
        let _usize_num: usize = 8;
        let _i8_num: i8 = 8;
        let result = Game::to_i8(_usize_num);
        assert_eq!(_i8_num, result);
    }

    #[test]
    fn test_to_i8_i8_max(){
        let _usize_num: usize = i8::MAX as usize;
        let result = Game::to_i8(_usize_num);
        assert_eq!(_usize_num, result as usize);
    }

    #[test]
    #[should_panic]
    fn test_to_i8_usize_max(){
        let _usize_num: usize = usize::MAX;
        let result = Game::to_i8(_usize_num);
        assert_eq!(_usize_num, result as usize);
    }
}