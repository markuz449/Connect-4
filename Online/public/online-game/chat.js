//make connection
var socket = io.connect('http://localhost:6969');

/*//Emit message
    test.click(function(){
    console.log("sending");
        socket.emit('new_message', {message : "hello"});
});*/

console.log("Connected");
window.choice_1 = () => {
    console.log("Sending");
    socket.emit('new_message', {message : "hello"});
}
    
 