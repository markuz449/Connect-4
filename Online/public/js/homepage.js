// Create Connection to server
var socket = io.connect('/');

var private_menu_display = false;
var join_menu_display = false;
var join_code;

if (sessionStorage.getItem("player_id") == null){
    console.log("Request new id");
    socket.emit('generate_player_id');
}

sessionStorage.removeItem("join_code");


/********** Functions -- Private **********/

function private_game_menu(){
    document.getElementById("private_game_menu").classList.remove("hidden-menu");
    document.getElementById("game_menu").classList.add("hidden-menu");
    private_menu_display = true;
}

function join_game_menu(){
    document.getElementById("join_game_menu").classList.remove("hidden-menu");
    document.getElementById("private_game_menu").classList.add("hidden-menu");
    join_menu_display = true;
}

function back(){
    if (join_menu_display){
        document.getElementById("join_game_menu").classList.add("hidden-menu");
        document.getElementById("private_game_menu").classList.remove("hidden-menu");
        join_menu_display = false;
    } else if (private_menu_display){
        document.getElementById("private_game_menu").classList.add("hidden-menu");
        document.getElementById("game_menu").classList.remove("hidden-menu");
        private_menu_display = false;
    }
}

function join_game(){
    join_code = document.getElementById("join_game_input").value;
    console.log(join_code);
    socket.emit("join_game", {join_code: join_code});
}


/********** Socket functions -- Interactions with the server **********/

socket.on('new_player_id', (data) => {
    sessionStorage.setItem("player_id", data.player_id);
});

socket.on('update_online_num', (data) => {
    document.getElementById("online_num").innerHTML = data.online_num;
});

socket.on('accepted_join_code', () => {
    console.log("Accepted Join Request");
    sessionStorage.setItem("join_code", join_code);
    var current_location = window.location.href;
    console.log("URL: " + current_location);
    window.location.replace(current_location + "private-game");
});

socket.on('rejected_join_code', () => {
    console.log("Rejected Join Request");
    document.getElementById("join_response").classList.remove("hidden-menu");
    var error_message = "Failed to Join with Game Code: " + join_code + ", Check that your code is correct!";
    console.log(error_message)
    document.getElementById("join_response").innerHTML = error_message;
});