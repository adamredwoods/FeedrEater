function setup() {

   socket = io.connect("http://localhost:3000");
   socket.on("update", function(data) {
      
   });
}

setup();
