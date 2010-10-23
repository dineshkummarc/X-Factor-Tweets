var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('./vendor/Socket.IO-node/'),
		sys = require('sys'),
	TwitterNode = require('twitter-node').TwitterNode;

	var USERNAME = process.ARGV[2];
	var PASSWORD = process.ARGV[3];
	var KEYWORD  = process.ARGV[4] || "xfactor";	  

if (!USERNAME || !PASSWORD)
 return sys.puts("Usage: node server.js <twitter_username> <twitter_password> <keyword>");


var twit = new TwitterNode({
 user: USERNAME, 
 password:  PASSWORD,
});
var broadcast_clients = [];

twit.track(KEYWORD)
var buffer = [];
twit
 .addListener('tweet', function(tweet) {
	callbackAddTweet(tweet.text);
 })

 .addListener('end', function(resp) {
   	for(var i=0; i < broadcast_clients.length; i++) {
			callbackAddTweet('end');
		}
 })
 .stream();
		

server = http.createServer(function(req, res){
	// your normal server code
	var path = url.parse(req.url).pathname;
	switch (path){
	
		case '/':
			fs.readFile(__dirname + '/static/index.html', function(err, data){
				if (err) return send404(res);
				res.writeHead(200, 'text/html');
				res.write(data, 'utf8');
				res.end();
			});
			break;
			
		default:
			sys.puts(__dirname + '/static' + path);
			fs.readFile(__dirname + '/static' + path, function(err, data){
				if (err) return send404(res);
				switch(path.substring(path.lastIndexOf('.')+1)) {
					case 'css':
						res.writeHead(200, {'Content-Type': 'text/css'});
					break;
					case 'js':
						res.writeHead(200, {'Content-Type': 'text/javascript'});
					break;
					case 'html':
						res.writeHead(200, {'Content-Type': 'text/html'});
					break;
					case 'png':
						res.writeHead(200, {'Content-Type': 'image/png'});
					break;
					default:
						res.writeHead(200, {'Content-Type': 'text/html'});
					break;
						
				}
				res.write(data, 'utf8');
				res.end();
			});
			break;
	}
}),

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(80)
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server);
		
		
io.on('connection', function(client){
	broadcast_clients.push(client) ;
	client.send({ buffer: buffer });
	client.send(logged_history[-2]);
	client.send(logged_history[-1]);
	
	client.on('message', function(message){
		var msg = { message: [client.sessionId, message] };
		buffer.push(msg);
		if (buffer.length > 15) buffer.shift();
		client.broadcast(msg);
	});

	client.on('disconnect', function(){
		broadcast_clients.pop(client);
	
	});
});


// PROCESS TWEETS

var logged_history = [{date:new Date(), words:{}},{date:new Date(), words:{}}];
var words = {};
var timeinterval = 5000;

// each new tweet
var RE_break_into_words = /\b(\w+)\b/g;
var callbackAddTweet = function(tweet) {
	// break into "words"
	var matches = tweet.match(RE_break_into_words);
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
	for(var i=0; i < broadcast_clients.length; i++) {
		broadcast_clients[i].send(new_log)
	}
	words = [];
}, timeinterval);

