var session_name="feedcache";

var feed = document.getElementsByClassName("feed")[0];
var totalfeed=[];

function appendFeed(data, cache) {
   for(let i=0; i<data.length; i++) {
      var pp = document.createElement("p");
      var img = document.createElement("img");
      img.setAttribute("src",data[i].imgurl);
      img.setAttribute("width","80px");
      var a = document.createElement("a");
      a.textContent = data[i].title;
      a.setAttribute("href",data[i].url);
      a.setAttribute("target","_blank");
      var date = document.createElement("div");
      date.textContent = data[i].date;
      pp.appendChild(img);
      pp.appendChild(a);
      pp.appendChild(date);
      feed.appendChild(pp);

      //--implement a cache for current feed
      if(cache) {
         totalfeed.push(data[i]);
      }
   }
}

function setup() {

   var socket = io.connect("http://localhost:3000");

   socket.on("update", function(data) {

      sessionStorage.setItem(session_name, JSON.stringify(data));
      appendFeed(data, true);

   });

   socket.on("savecache", function(){
      console.log("cache");
      //appendFeed(JSON.parse(sessionStorage.getItem(session_name)));
      sessionStorage.setItem(session_name, JSON.stringify(totalfeed));
   });

   socket.on("clearcache", function(){
      sessionStorage.setItem(session_name, "");
   });
}

setup();
if(sessionStorage.getItem(session_name)) {
   appendFeed(JSON.parse(sessionStorage.getItem(session_name)), false);
}
