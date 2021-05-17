"use strict";

module.exports = function(root) {

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx.fillStyle = "#4ba28bff";

	let reservations = [];
	reserver(root, reservations);

	for (let y = 0; y < reservations.length; y++) {

		for (let n = 0; n < reservations[y].length; n++) {

			let o = reservations[y][n];

			let x = o[0];

			let gx = x * 16 + 16;
			let gy = y * 16 + 16;

			ctx.beginPath();
			ctx.arc(gx, gy, 3, 0, 2 * Math.PI);
			ctx.fill();
		}
	}

	return;
}

// Perhaps the strategy is:
//
//		- When given a (local) root node, traverse the main line and find the x location for the whole line (the rightmost x necessary)
//		- Set all the nodes in the main line to that x
//		- Starting at the bottom, perform the above on each non-main-line node.

function reserver(local_root, reservations) {

	// Reservations is an array of format [y] --> list of [x, node]

	let main_line_x = 0;

	let node = local_root;

	while (true) {
		let y = node.depth;
		if (reservations[y]) {
			let rightmost = reservations[y][reservations[y].length - 1][0];
			if (rightmost >= main_line_x) {
				main_line_x = rightmost + 1;
			}
		}
		if (node.children.length === 0) {
			break;
		}
		node = node.children[0];
	}

	node = local_root;

	let subtree_roots = [];

	while (true) {
		let y = node.depth;
		if (!reservations[y]) {
			reservations[y] = [];
		}
		reservations[node.depth].push([main_line_x, node]);
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

	for (let child of subtree_roots) {
		reserver(child, reservations);
	}

	return;
}

