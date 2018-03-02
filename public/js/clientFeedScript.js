const REQUEST_TIME = 100;

//
//--event handler for sort button
var sortTypes = ["All by Date", "By URL"];
var currentSort = 0;
var sortSelector = document.getElementsByClassName("sort-selector")[0];
var lastReceived = ""; //--store the source of the last feed received to prevent repeat pulls
//
//
//--get data from server
var feed = document.getElementsByClassName("feed")[0];
var totalfeed=[];

if(sortSelector) {
   sortSelector.addEventListener("click",function(event) {
      currentSort++;
      if (currentSort>sortTypes.length-1) currentSort=0;
      setSortText();
      update();
   });
}

function setSortText() {
   sortSelector.textContent = sortTypes[currentSort];
}


//--could appendFeed to totalfeed, then call update feed where updateFeed will sort and display

function update() {
   if(!feed) return;

   var htmlfeed;

   if(currentSort===0) {
      totalfeed = totalfeed.sort(function(a,b) {
         if (a.date>b.date) return -1;
         if (a.date<b.date) return 1;
         return 0;
      });

      htmlfeed = createSortByDateFeed();

   } else if(currentSort===1) {

      //--sort by sourceRank, then by date if equal
      totalfeed = totalfeed.sort(function(a,b) {
         if (a.sourceRank===b.sourceRank) {
            if (a.date>b.date) return -1;
            if (a.date<b.date) return 1;
            return 0;
         }
         return (a.sourceRank - b.sourceRank);
      });
      htmlfeed = createSortBySiteFeed();
   }

   feed.replaceChild(htmlfeed, feed.childNodes[0]);
}

function createSortByDateFeed() {

   var htmlfeed = document.createElement("div");

   for(let i=0; i<totalfeed.length; i++) {

      //-- make substitute icon
      let h2 = "";
      let url = totalfeed[i].imgurl;
      if(totalfeed[i].imgurl.length<3) {
         h2="<h2>"+totalfeed[i].imgurl[0]+"</h2>";
         url="";
      }

      let h = "<div class='rss-list-block'><div class='rsslist-image'><img src='"+url+"' width='120px' style='display:inline; margin-right:20px'>"+h2+"</div>"
      h+= "<div class='rsslist-titleblock'><a href='"+totalfeed[i].url+"' class='rsslist-title' target='_blank'>"+totalfeed[i].title+"</a>"
      h+= "<div><div class='source-tag'>"+totalfeed[i].source+"<span>"+totalfeed[i].date+"</span></div></div></div></div>"
      htmlfeed.innerHTML+=h;

   }

   return htmlfeed;
}

function createSortBySiteFeed() {

   var htmlfeed = document.createElement("div");
   var currentSource = "";

   var pp;

   for(let i=0; i<totalfeed.length; i++) {

      let h="";

      if (currentSource !== totalfeed[i].source) {

         //-- make substitute icon
         let h2 = "";
         let url = totalfeed[i].imgurl;
         if(totalfeed[i].imgurl.length<3) {
            h2="<h2>"+totalfeed[i].imgurl[0]+"</h2>";
            url="";
         }

         h += "<div class='rss-list-block'><hr><img src='"+url+"' width='120px' style='display:inline; margin-right:20px'>"+h2+""
         h += "<div class='source-tag-h2'>"+totalfeed[i].source+"</div></div>"


         currentSource = totalfeed[i].source;
      }

      h+= "<div class='rsslist-titleblock'><a href='"+totalfeed[i].url+"' class='rsslist-title' target='_blank'>"+totalfeed[i].title+"</a></div>"
      h+= "<div class='source-tag'><span>"+totalfeed[i].date+"</span></div></div>"
      htmlfeed.innerHTML+=h;


   }

   return htmlfeed;
}

function appendFeed(data, cache) {

   for(let i=0; i<data.length; i++) {
      //--implement a cache for current feed
      if(cache) {
         totalfeed.push(data[i]);
      }
   }
   update();

}

function getData() {

   ajax().get("/user/feeddata").then(function(res, xhr) {
      //-- exit on server errors
console.log("total",res.total);
      if (xhr.status>400 || !res.total) {
         //clearInterval(interval);
         return;
      } else {
         let obj = JSON.parse(xhr.response);
         console.log(obj)
         if (obj.total>0) {
            if(obj.data && obj.data[0] && obj.data[0].source !== lastReceived) {
               lastReceived = obj.data[0].source;
               appendFeed(obj.data, true);

            }
            setTimeout(getData, REQUEST_TIME);
         } else {
            lastReceived ="";
            //clearInterval(interval);
         }
      }
   })
}

//--sort first time
setSortText();

var interval = setTimeout(getData,REQUEST_TIME);
