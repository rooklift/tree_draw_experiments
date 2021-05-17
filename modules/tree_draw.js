"use strict";

module.exports = function(root) {

	if (!root) {
		return;
	}

	let start_time = performance.now();

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	reserver(root, []);
	__draw(root, ctx);
};

function __draw(node, ctx) {

	ctx.fillStyle = "#4ba28bff";

	while (true) {

		let gx = node.graphx * 16 + 16;
		let gy = node.depth * 16 + 16;

		ctx.beginPath();
		ctx.arc(gx, gy, 3, 0, 2 * Math.PI);
		ctx.fill();

		if (node.children.length > 1) {
			for (let child of node.children) {
				__draw(child, ctx);
			}
			break;
		} else if (node.children.length === 1) {
			node = node.children[0];
			continue;
		} else {
			break;
		}
	}
};

function reserver(local_root, reservations) {

	// Traverse the main line and find the x location for the whole line (the rightmost x necessary)

	let main_line_x = 0;
	let node = local_root;

	while (true) {
		let y = node.depth;
		if (reservations[y] !== undefined && reservations[y] >= main_line_x) {
			main_line_x = reservations[y] + 1;
		}
		if (node.children.length === 0) {
			break;
		}
		node = node.children[0];
	}

	// As some special sauce, pretend the line is 1 longer than it is...

	let y = node.depth + 1;
	if (reservations[y] !== undefined && reservations[y] >= main_line_x) {
		main_line_x = reservations[y] + 1;
	}

	// Set all the nodes in the main line to that x...
	// Make a list of subtrees that need handling...

	node = local_root;
	let subtree_roots = [];

	while (true) {
		reservations[node.depth] = main_line_x;
		node.graphx = main_line_x;
		if (node.children.length === 0) {
			break;
		} else if (node.children.length >= 2) {
			for (let n = node.children.length - 1; n > 0; n--) {
				subtree_roots.push(node.children[n]);
			}
		}

		node = node.children[0];
	}

	subtree_roots.reverse();

	// Handle the subtrees...

	for (let child of subtree_roots) {
		reserver(child, reservations);
	}
}

