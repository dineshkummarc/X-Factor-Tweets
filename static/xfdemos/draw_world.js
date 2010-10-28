function drawWorld(world, context) {
	for (var j = world.m_jointList; j; j = j.m_next) {
		drawJoint(j, context);
	}
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s, context);
		}
	}
}
function drawJoint(joint, context) {
	var b1 = joint.m_body1;
	var b2 = joint.m_body2;
	var x1 = b1.m_position;
	var x2 = b2.m_position;
	var p1 = joint.GetAnchor1();
	var p2 = joint.GetAnchor2();
	context.strokeStyle = '#00eeee';
	context.beginPath();
	switch (joint.m_type) {
	case b2Joint.e_distanceJoint:
		context.moveTo(p1.x, p1.y);
		context.lineTo(p2.x, p2.y);
		break;

	case b2Joint.e_pulleyJoint:
		// TODO
		break;

	default:
		if (b1 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
		}
		else if (b2 == world.m_groundBody) {
			context.moveTo(p1.x, p1.y);
			context.lineTo(x1.x, x1.y);
		}
		else {
			context.moveTo(x1.x, x1.y);
			context.lineTo(p1.x, p1.y);
			context.lineTo(x2.x, x2.y);
			context.lineTo(p2.x, p2.y);
		}
		break;
	}
	context.stroke();
}
function drawShape(shape, context) {
	context.strokeStyle = '#ffffff';
	context.beginPath();
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
		{
			var circle = shape;
			var pos = circle.m_position;
			var r = circle.m_radius;
			var segments = 16.0;
			var theta = 0.0;
			var dtheta = 2.0 * Math.PI / segments;

			// draw circle
			context.strokeStyle = 'rgba(0,0,0,0)';
			context.fillStyle = "rgba(128,0,0,0.5)";
			if (circle.m_userData.text=="X") {
				context.strokeStyle = 'rgba(0,0,0,0.8)';
				context.fillStyle = 'rgba(128,0,0,0.9)';
			}
			context.arc(pos.x, pos.y, r, 0, 2.0 * Math.PI, false);
			context.fill();

			// draw radius
			context.moveTo(pos.x, pos.y);
			var ax = circle.m_R.col1;
			context.strokeStyle = 'rgba(255,255,255,0.5)';
//			context.lineTo(pos.x + r * ax.x, pos.y + r * ax.y);
			
			// draw text
			if (circle.m_userData && circle.m_userData.text) {
				context.fillStyle = "white";
				context.font = "12px avemedium, 'Avenir LT Std', 'Avenir LT Pro', Avenir, Helvetica, Arial, sans-serif";
				context.textAlign = "center";
				context.fontWeight = "bold";
//				if (r>=20)
					context.fillText(circle.m_userData.text, pos.x, pos.y+5);
			}
			
		}
		break;
	case b2Shape.e_polyShape:
		{
			var poly = shape;
			var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
			context.moveTo(tV.x, tV.y);
			for (var i = 0; i < poly.m_vertexCount; i++) {
				var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
				context.lineTo(v.x, v.y);
			}
			context.lineTo(tV.x, tV.y);
		}
		break;
	}
	context.stroke();
}

