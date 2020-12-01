// Create Connection to server
var socket = io.connect('/');

var private_menu_display = false;
var join_menu_display = false;

/********** Functions -- Private **********/

function private_game_menu(){
    document.getElementById("private-game-menu").classList.remove("hidden-menu");
    document.getElementById("game-menu").classList.add("hidden-menu");
    private_menu_display = true;
}

function join_game_menu(){
    document.getElementById("join-game-menu").classList.remove("hidden-menu");
    document.getElementById("private-game-menu").classList.add("hidden-menu");
    join_menu_display = true;
}

function back(){
    if (join_menu_display){
        document.getElementById("join-game-menu").classList.add("hidden-menu");
        document.getElementById("private-game-menu").classList.remove("hidden-menu");
        join_menu_display = false;
    } else if (private_menu_display){
        document.getElementById("private-game-menu").classList.add("hidden-menu");
        document.getElementById("game-menu").classList.remove("hidden-menu");
        private_menu_display = false;
    }
}

function join_game(form){
    console.log(form.private_game_code.value);
}


/********** Window interactions -- public**********/



/********** Socket functions -- Interactions with the server **********/

socket.on('new_player_id', (data) => {
    console.log(data.player_id);
    if (sessionStorage.getItem("player_id") == null){
        sessionStorage.setItem("player_id", data.player_id);
        console.log(sessionStorage.getItem("player_id"));
    }
});

socket.on('update_online_num', (data) => {
    online_num = data.online_num;
    document.getElementById("online_num").innerHTML = online_num;
});