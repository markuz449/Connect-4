// Create Connection to server
var socket = io.connect('/');

var private_menu_display = false;
var join_menu_display = false;


if (sessionStorage.getItem("player_id") == null){
    console.log("Request new id");
    socket.emit('generate_player_id');
}

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
    sessionStorage.setItem("player_id", data.player_id);
});

socket.on('update_online_num', (data) => {
    document.getElementById("online_num").innerHTML = data.online_num;
});