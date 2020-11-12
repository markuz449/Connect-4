use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
 
/// This is the main structure of the game. 
/// The game struct holds all of the important data that the game needs.
/// The structure holds the current board, the winner status, who the current player is, and, 
/// the refreneces to the player's choice function.
/// 
/// 
#[derive(Serialize, Deserialize, Debug)]
pub struct Game{
    pub board: Vec<Vec<usize>>,
    /// Winner can hold: 
    /// 
    ///   0 -> Game is not over
    /// 
    ///   1 -> Game won by Player 1
    /// 
    ///   2 -> Game won by Player 2
    /// 
    ///  -1 -> Game is a drawn
    pub winner: i8, 
    pub current_player: usize
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
        let game = Game {board, winner, current_player};
        game
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
        let mut horiz_count: i8 = 0;
        let mut verti_count: i8 = 0;
        let mut diag_count1: i8 = 0;
        let mut diag_count2: i8 = 0;
        
        horiz_count = horiz_count + Game::token_count(&self, player_choice, y_position,  1,  0,  0);
        horiz_count = horiz_count + Game::token_count(&self, player_choice, y_position, -1,  0, -1);
        verti_count = verti_count + Game::token_count(&self, player_choice, y_position,  0,  1,  0);
        verti_count = verti_count + Game::token_count(&self, player_choice, y_position,  0, -1, -1);
        diag_count1 = diag_count1 + Game::token_count(&self, player_choice, y_position, -1,  1,  0);
        diag_count1 = diag_count1 + Game::token_count(&self, player_choice, y_position,  1, -1, -1);
        diag_count2 = diag_count2 + Game::token_count(&self, player_choice, y_position,  1,  1,  0);
        diag_count2 = diag_count2 + Game::token_count(&self, player_choice, y_position, -1, -1, -1);
        
        // Checks to see if player has beaten the game
        if horiz_count >= 4 || verti_count >= 4 || diag_count1 >= 4 || diag_count2 >= 4{
            self.winner = Game::to_i8(self.current_player);
        } else{
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
    pub fn token_count(&self, mut pos_x: usize, mut pos_y: usize, x_pos_change: i8, y_pos_change: i8, mut count: i8) -> i8{
        //Player Check
        if self.board[pos_x][pos_y] != self.current_player {
            return count;
        }
        
        //Boundary Checks
        let x_bound_check = pos_x as i8;
        let y_bound_check = pos_y as i8;
        if (x_bound_check + x_pos_change < 0 || y_bound_check + y_pos_change < 0) || (x_bound_check + x_pos_change >= 7 || y_bound_check + y_pos_change >= 6) {
            count += 1;
            return count;
        }
        
        pos_x = Game::update_position(pos_x, x_pos_change);
        pos_y = Game::update_position(pos_y, y_pos_change);
        count += 1;
        Game::token_count(self, pos_x, pos_y, x_pos_change, y_pos_change, count)
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
        let result = Game::to_option_i8(num);
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
    fn to_option_i8(num: usize) -> Option<i8>{
        if num > std::i8::MAX as usize {
            None
        } else {
            Some(num as i8)
        }
    }

}

#[wasm_bindgen]
extern "C" {
  // Use `js_namespace` here to bind `console.log(..)` instead of just
  // `log(..)`
#[wasm_bindgen(js_namespace = console)]
pub fn log(s: &str);
}