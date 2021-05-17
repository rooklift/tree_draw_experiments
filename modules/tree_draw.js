"use strict";

module.exports = function(root) {

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx.fillStyle = "#4ba28bff";

	let node = root;

	let gx = 16;
	let gy = 16;

	while (node) {

		ctx.beginPath();
		ctx.arc(gx, gy, 3, 0, 2 * Math.PI);
		ctx.fill();

		node = node.children[0];
		gy += 16;

		console.log(gx, gy)
	}

	return;
}

