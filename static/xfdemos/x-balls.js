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
	if (radius<1) {
		if (word_balls[word]) {
			// destruction doesn't seem to work
//			world.DestroyBody(word_balls[word]);
//			word_balls[word] = null;
		}
		return;
	}
	if (!word_balls[word]) {
		var offset = {x:Math.random()*10 - 5, y:Math.random()*10 - 5};
		xballs.balls.push(word_balls[word] = xballs.createBall(world, centre.x+offset.x, centre.y+offset.y, 10, false, word));
	}
	word_balls[word].scaleTo(radius*5);
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
var timeinterval = 5000;

// each new tweet
	var RE_break_into_words = /\b(\w+)\b/g;
	var callbackAddLog = function(log_obj) {
		// add to history
//		console.log(log_obj);
		logged_history.push(log_obj);
	};

	
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
			
			// fill out the new word set with missing words, mostly so they can be removed
			for (var word in oldwords.words) {
				if (!newwords.words[word]) {
					newwords.words[word] = 0;
				}
			}
			for (var word in newwords.words) {
				// work out new count (float)
				// set radius (or delete) (or add)
				if (!oldwords.words[word]) continue;
				var countDelta = (newwords.words[word] - oldwords.words[word]) * dateDiff;
				xballs.setWordBall(word, countDelta + oldwords.words[word]);
			}
			
		}, 100);

		
		// get the tweets!
		
		function esc(msg){
			return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		};
		
		var socket = new io.Socket(null, {port: 80});
		socket.connect();
		socket.on('message', function(obj){
			if (obj['buffer']){
				for (var i in obj.buffer) callbackAddLog(obj.buffer[i]);
			} else callbackAddLog(obj);
		});
		var socket_timer = 1;
		socket.on('disconnect', function(){
			socket_timer *= 2;
			setTimeout(socket.connect, socket_timer*500);
		}) 

	});









