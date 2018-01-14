//--get data from server
var interval = setInterval(getData,1000);


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

   var htmlfeed = document.createElement("div");

   for(let i=0; i<totalfeed.length; i++) {
      var pp = document.createElement("p");
      var line1 = document.createElement("div");
      line1.setAttribute("class","rsslist-image");
      var img = document.createElement("img");
      img.setAttribute("src",totalfeed[i].imgurl);
      img.setAttribute("width","80px");
      img.setAttribute("style","display:inline; margin-right:20px;");

      if(totalfeed[i].imgurl.length<3) {
         img.setAttribute("src","");
         img = document.createElement("h2");
         img.textContent = totalfeed[i].imgurl[0];
      }
      line1.appendChild(img);

      var titleblock = document.createElement("div");
      titleblock.setAttribute("class","rsslist-titleblock");
      var a = document.createElement("a");
      a.textContent = totalfeed[i].title;
      a.setAttribute("href",totalfeed[i].url);
      a.setAttribute("class","rsslist-title");
      a.setAttribute("target","_blank");
      titleblock.appendChild(a);
      var line2 = document.createElement("div");
      var source = document.createElement("div");
      source.setAttribute("class","source-tag");
      source.textContent = totalfeed[i].source;
      line2.appendChild(source);
      var date = document.createElement("span");
      date.textContent = totalfeed[i].date;
      line2.appendChild(date);
      pp.appendChild(line1);
      pp.appendChild(titleblock);
      pp.appendChild(line2);

      htmlfeed.appendChild(pp);
   }

   while (feed.firstChild) {
       feed.removeChild(feed.firstChild);
   }
   feed.appendChild(htmlfeed);
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

function getData() {
   ajax().get("/user/feeddata").then( function(res, xhr) {
      appendFeed(JSON.parse(xhr.response)), true);
   })
}
