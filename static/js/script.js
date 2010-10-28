/* Author: 

*/
/*
// Creates canvas 320 × 200 at 10, 50
var paper = Raphael("xfactor", 320, 200);

// Creates circle at x = 50, y = 40, with radius 10
var circle = paper.circle(50, 40, 10);
// Sets the fill attribute of the circle to red (#f00)
circle.attr("fill", "#f00");

// Sets the stroke attribute of the circle to white
circle.attr("stroke", "#fff");
*/
var XFTweets = (function($){
	
	var paper;
	var CONTESTANT_HEIGHT = 50;
	var contestants = {};
	var ranks = 1;
	var contestantCount = 0;
	var mentorCols = {
		'simon':'rgba(255,0,0,0.5)',
		'louis':'rgba(0,255,0,0.5)',
		'cheryl':'rgba(0,0,255,0.5)',
		'dannii':'rgba(0,0,0,0.5)',
	};
	var Contestant = function(data) {
		this.history = [];
		this.data = data;
		if (this.data.rank===0) this.data.rank = ranks++;
		//create node for contestant
		this.$el = $('<div class="contestant"></div>');
		this.el = this.$el[0];
		this.el.id = data.name.replace(/ /g,'-').toLowerCase();
		this.$el.append($('<h2>'+data.name+'</h2>'));
		this.$el.append($('<img src="images/'+data.image+'" width="50">'));
		this.$el.css({
				top:((contestantCount-this.data.rank)*CONTESTANT_HEIGHT)+'px',
			});
		$('#xfactor').append(this.$el);
		
		this.path = paper.path("M0 "+(((contestantCount-this.data.rank)*CONTESTANT_HEIGHT)+10));
		this.path.attr("stroke", mentorCols[this.data.mentor]);
		this.path.attr("stroke-width", "10px");
	};
	Contestant.prototype.addTweet = function() {
		this.data.mention_count++;
		$('h2', this.$el).html(this.data.name + ' (' + this.data.mention_count + ')');
	};
	Contestant.prototype.updateLine = function() {
		this.history.push(this.data.rank);
/*
		var offsetHistory = Math.max(this.history.length-10,0);
		var pathstr = '';
		for (var i=offsetHistory;i<this.history.length;i++) {
			if (i==offsetHistory) pathstr+='M';
				else pathstr+='L';
			pathstr+=(60*(i-offsetHistory))+" "+(((contestantCount-this.history[i])*CONTESTANT_HEIGHT)+(CONTESTANT_HEIGHT/2));
		}
*/
		var svgWidth = 570;
		var stepWidth = svgWidth/this.history.length;
		var pathstr = '';
		for (var i=0;i<this.history.length;i++) {
			if (i==0) pathstr+='M';
				else pathstr+='L';
			pathstr+=(stepWidth*i)+" "+(((contestantCount-this.history[i])*CONTESTANT_HEIGHT)+(CONTESTANT_HEIGHT/2));
		}

		this.path.attr("path", pathstr);
	};
	Contestant.prototype.setRank = function(rank) {
		this.data.rank = rank;
		this.$el.animate({
			top:((contestantCount-this.data.rank)*CONTESTANT_HEIGHT)+'px',
		}, 500);
	};

	
	var updateLines = function() {
		for (var name in contestants) {
			contestants[name].updateLine();
		}
	};
//	var timer = setInterval(updateLines, 500);
	
	var callbackContestants = function(data) {
		var paperHeight = data.contestants.length*CONTESTANT_HEIGHT;
		paper = Raphael("xfactor", 570, paperHeight);
		$('#xfactor').height(paperHeight);
		
		contestantCount = data.contestants.length;
		for (var i=0;i<data.contestants.length;i++) {
			contestants[data.contestants[i].name.replace(/ /g,'-').toLowerCase()] = new Contestant(data.contestants[i]);
		}
		rankContestants();
	};
	var callbackAddTweet = function(tweet) {
		for (var name in contestants) {
			var reg = new RegExp(contestants[name].data.twitter_keywords, 'i');
			
			if (tweet.text.match(reg)) {
//				console.log(tweet.text, contestants[name].data.twitter_keywords, tweet.text.match(reg));
				contestants[name].addTweet(tweet.text);
			}
		}
		var $newTweet = $('<div class="tweet"></div>');
		$newTweet.append('<img src="' + tweet.image + '" width="50" height="50"/>');
		$newTweet.append('<blockquote>' + tweet.text + '</blockquote>');
		$newTweet.append('<cite>@<a href="http://twitter.com/' + tweet.author + '">' + tweet.author + '</a></cite>');
		$newTweet.hide();
		$('aside .tweet').fadeOut('fast', function() {
			$(this).remove();
		});
		$('aside').append($newTweet);
		$newTweet.fadeIn('fast');
		rankContestants();
	};
	var rankContestants = function() {
		var sortArr = [];
		var rerankFlag = false;
		for (var name in contestants) {
			sortArr.push(contestants[name]);
		}
		sortArr.sort(function(a,b) {
			return (a.data.mention_count - b.data.mention_count);
		});
		for (var i=0;i<sortArr.length;i++) {
			if (sortArr[i].data.rank!==(i+1)) {
				rerankFlag = true;
				sortArr[i].setRank(i+1);
			}
		}
		if (rerankFlag) updateLines();
	};
	
	
	// Every message recevied updates the counts,
	// and also displays a tweet next to their position
	
	
	return {
		callbackContestants:callbackContestants,
		callbackAddTweet:callbackAddTweet
	};
}(jQuery));


//Load Contestant data
jQuery.getScript( 'js/x-contestants.js' )


//Load the stream

  function message(obj){
	XFTweets.callbackAddTweet({text:obj.text, image:obj.image, author:obj.author});
	callbackAddTweet(obj);
  }
  
  
  function esc(msg){
    return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  
  var socket = new io.Socket(null, {port: 80});
  socket.connect();
  socket.on('message', function(obj){
    if ('buffer' in obj){
      //document.getElementById('form').style.display='block';
      document.getElementById('chat').innerHTML = '';
      
      for (var i in obj.buffer) message(obj.buffer[i]);
    } else message(obj);
  });


// enable the @anywhere tweet box
  twttr.anywhere(function (T) {
    T("#tbox").tweetBox({
    	defaultContent: "I'm watching the XFactor with XFactor Tweets! #xfactor http://xfactortweets.com",
    	width:680,
    	height:65,
    	label:'Tweet your support!'
    });
  });

