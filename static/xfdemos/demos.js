var initId = 0;
var world = createWorld();
var ctx;
var canvasWidth;
var canvasHeight;
var canvasTop;
var canvasLeft;

function setupWorld() {
	world = createWorld();
	xballs.initWorld(world);
}
function createWorld() {
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var gravity = new b2Vec2(0, 0);
	var doSleep = true;
	var world = new b2World(worldAABB, gravity, doSleep);
/*
	createGround(world);
	createBox(world, 0, 125, 10, 250);
	createBox(world, 500, 125, 10, 250);
*/
	return world;
}
function step(cnt) {
	var stepping = false;
	var timeStep = 1.0/60;
	var iteration = 1;

	world.Step(timeStep, iteration);

	//kpk add force
	for (var i=0;i<xballs.balls.length;i++) {
		var ball = xballs.balls[i];
		var ballPos = ball.GetCenterPosition();
		var centrePos = xballs.centreball.GetCenterPosition();
//		var massEffect = ball.GetMass() / 100;
		var massEffect = ball.m_shapeList.m_radius;
		var myForce = new b2Vec2((centrePos.x - ballPos.x)*massEffect, (centrePos.y - ballPos.y)*massEffect);
//		console.log(myForce, ball.m_mass, myForce.Multiply);
		ball.ApplyImpulse(myForce, ballPos);
	}

//    xballs.ball.ApplyImpulse(myForce, xballs.ball.GetCenterPosition());

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	drawWorld(world, ctx);
	setTimeout('step(' + (cnt || 0) + ')', 10);
}
$(document).ready(function(){
	setupWorld();
	var canvasElm = $('#canvas')[0];
	ctx = canvasElm.getContext('2d');
	canvasWidth = parseInt(canvasElm.width);
	canvasHeight = parseInt(canvasElm.height);
	canvasTop = parseInt(canvasElm.style.top) || 0;
	canvasLeft = parseInt(canvasElm.style.left) || 0;
	step();
});
