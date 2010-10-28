xballs = {};
xballs.createBall = function(world, x, y, rad, fixed, text) {
	var ballSd = new b2CircleDef();
	if (!fixed) ballSd.density = 1.0;
	ballSd.radius = rad || 10;
	ballSd.restitution = 0.2;
	ballSd.userData = {text:text};
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	var bdy = world.CreateBody(ballBd);
	return bdy;
};
// add the scale mechanic to the b2Body
b2Body.prototype.scaleTo = function(a) {
	var s = this.m_shapeList;
	while (s)
	{
		s.m_radius = a;
		var s0 = s;
		s = s.m_next;
	}
} 

var word_balls = {};

xballs.setWordBall = function(word, radius) {
	var centre = xballs.centreball.GetCenterPosition();
	if (radius<0.2) {
		if (word_balls[word]) {
			// destruction doesn't seem to work
			world.DestroyBody(word_balls[word]);
			word_balls[word] = null;
		}
		return;
	}
	if (!word_balls[word]) {
		var scalefactor = radius*15;
		var offset = {x:Math.random()*scalefactor - (scalefactor/2), y:Math.random()*scalefactor - (scalefactor/2)};
		xballs.balls.push(word_balls[word] = xballs.createBall(world, centre.x+offset.x, centre.y+offset.y, scalefactor, false, word));
	}
	try {
		word_balls[word].scaleTo(radius*15);
	} catch (e) {
		// no idea why this gets thrown in FF
	}
}
xballs.initWorld = function(world) {

	// one ball in the centre, fixed
	var canvasElm = $('#canvas')[0];
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);

	// other balls surround it, weighted to centre
	xballs.balls = [];
	xballs.centreball = xballs.createBall(world, canvasWidth/2, canvasHeight/2, 20, true, 'X');

};

// xfactor stuff

// array of timestamp->words->count
var logged_history = [{date:new Date(), words:{}},{date:new Date(), words:{}}];
var words = {};
var timeinterval = 5000;

// each new tweet
	
	$(document).ready(function(){

		// change size of blobs
		setInterval(function() {
			// we're not reacting instantly here.
			// let's take the last two timestamps, and use those.
			// so we're always one timeinterval off.
			
			// calculate distance between old time and new timestamp
			var oldwords = logged_history[logged_history.length-2];
			var newwords = logged_history[logged_history.length-1];
			if (!newwords.updatedate) newwords.updatedate = new Date();
			var dateDiff = (new Date() - newwords.updatedate) / timeinterval;
			
			var biggestSize = 0;
			// fill out the new word set with missing words, mostly so they can be removed
			for (var word in oldwords.words) {
				if (!newwords.words[word]) {
					newwords.words[word] = 0;
				}
			}
			for (var word in newwords.words) {
				// work out a limit on size
				biggestSize = Math.max(biggestSize, newwords.words[word]);
			}
			var maxCounter = 0;
			for (var word in newwords.words) {
				// work out new count (float)
				// set radius (or delete) (or add)
				if (!oldwords.words[word]) oldwords.words[word] = 0;
				var countDelta = (newwords.words[word] - oldwords.words[word]) * dateDiff
				var newRadius = countDelta + oldwords.words[word];
				if (newwords.words[word] < biggestSize - 20) newRadius = 0;
				xballs.setWordBall(word, newRadius*3/biggestSize);
			}
			
		}, 100);

		
		// get the tweets!
		
		// (called from script.js)
	});


// PROCESS TWEETS


// each new tweet
var RE_break_into_words = /\b(\w+)\b/g;
var callbackAddTweet = function(tweet) {
	// break into "words"
	var matches = tweet.text.match(RE_break_into_words);
	for (var i=0;i<matches.length;i++) {
		var word = matches[i];
		// increment each word
		if (words[word]) words[word]++;
		else words[word] = 1;
	}
};

// update history
setInterval(function() {
	// if time>timestamp, create new timestamp
	var new_words  = {};
	for (var word in words) {
		new_words[word] = words[word];
	}
	var new_log = {date:new Date(), words:new_words};
	logged_history.push(new_log);
	words = [];
}, timeinterval);







