<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/markuz449/Connect-4">
    <img src="images/logo.png" alt="Logo" width="200" height="200">
  </a>

  <h3 align="center">Connect 4</h3>

  <p align="center">
    This is a simple connect 4 game that is built in Rust.
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

This project is the simple game of connect 4. I wanted to learn a new language and thought this would be a great project to do. The entire project has been built from the ground up and currently only works through terminal.


### Built With

* [Rust](https://www.rust-lang.org/)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Rust
```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Installation
 
1. Clone the Connect-4
```sh
git clone https://github.com/markuz449/Connect-4.git
```
2. Build using Cargo
```sh
cargo build
```
2. Run using Cargo
```sh
cargo run
```



<!-- USAGE EXAMPLES -->
## Usage

This is a simple game that can be ran from the terminal and can be played by two different people. 

<p align="center">
  <img src="images/Gameplay.png">
  </img>
</p>

The player class is a simple interactive class which takes the user's move from terminal. I've added functionality to the program so that it could be ran to face off against an AI program so you could have a solo player experience. 

To change to a different player you need to change the refrence to the player which can be done in game.rs

<p align="center">
  <img src="images/Player_Select.png">
  </img>
</p>

You need to ensure that whatever function that you changee to it takes in the game state as an input and returns a usize which maps to the players move.


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/markuz449/Connect-4/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the GNU General Public License v3.0 License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Marcus Anderson - markuz449@gmail.com

Project Link: [https://github.com/markuz449/Connect-4](https://github.com/markuz449/Connect-4)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [Rust Docs](https://doc.rust-lang.org/book/ch00-00-introduction.html)
* [Choose an Open Source License](https://choosealicense.com)

