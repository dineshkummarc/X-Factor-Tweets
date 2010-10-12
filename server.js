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
   for(var i=0; i < broadcast_clients.length; i++) {
		broadcast_clients[i].send({text:tweet.text, author:tweet.user.screen_name, image:tweet.user.profile_image_url})
	}
 })

 .addListener('end', function(resp) {
   	for(var i=0; i < broadcast_clients.length; i++) {
			broadcast_clients[i].send({message:[1,"wave goodbye... " + resp.statusCod]})
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
			
		case '/json.js':
			fs.readFile(__dirname + path, function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'});
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