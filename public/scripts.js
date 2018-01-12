var session_name="feedcache";

var feed = document.getElementsByClassName("feed")[0];
var totalfeed=[];

//--could appendFeed to totalfeed, then call update feed where updateFeed will sort and display

function update() {
   if(!feed) return;

   totalfeed = totalfeed.sort(function(a,b) {
      if (a.date>b.date) return -1;
      if (a.date<b.date) return 1;
      return 0;
   });

   for(let i=0; i<totalfeed.length; i++) {
      var pp = document.createElement("p");
      var img = document.createElement("img");
      img.setAttribute("src",totalfeed[i].imgurl);
      img.setAttribute("width","80px");

      if(totalfeed[i].imgurl.length<3) {
         img = document.createElement("h2");
         img.setAttribute("style","display:inline; margin-right:20px;");
         img.textContent = totalfeed[i].imgurl[0];
      }

      var a = document.createElement("a");
      a.textContent = totalfeed[i].title;
      a.setAttribute("href",totalfeed[i].url);
      a.setAttribute("target","_blank");
      var date = document.createElement("div");
      date.textContent = totalfeed[i].date;
      pp.appendChild(img);
      pp.appendChild(a);
      pp.appendChild(date);
      feed.appendChild(pp);
   }
}

function appendFeed(data, cache) {
   //if(!feed) return;

   for(let i=0; i<data.length; i++) {

      //--implement a cache for current feed
      if(cache) {
         totalfeed.push(data[i]);
      }
   }

   update();
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
      totalfeed = [];
   });
}

setup();
if(sessionStorage.getItem(session_name)) {
   appendFeed(JSON.parse(sessionStorage.getItem(session_name)), false);
}
