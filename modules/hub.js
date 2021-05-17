"use strict";

const fs = require("fs");

const {defaults_classified} = require("./config_io");
const load_sgf = require("./load_sgf");
const tree_draw = require("./tree_draw");

exports.new_hub = function() {
	let hub = Object.create(hub_props);
	hub.root = null;
	return hub;
};

let hub_props = {

	open: function(filepath) {
		let roots;
		try {
			let buf = fs.readFileSync(filepath);
			roots = load_sgf(buf);
		} catch (err) {
			alert(err);
			return;
		}
		this.root = roots[0];
		this.draw();
	},

	draw: function() {
		tree_draw(this.root);
	},

	set: function(key, value) {
		config[key] = value;
		save_config();
		this.take_followup_actions([key]);
	},

	take_followup_actions: function(keys) {

		if (Array.isArray(keys) === false) {
			throw "take_followup_actions(): bad call";
		}

		let hits = {};
		let classifiers = Object.keys(defaults_classified);

		for (let key of keys) {
			for (let cl of classifiers) {
				if (defaults_classified[cl][key] !== undefined) {
					hits[cl] = true;
				}
			}
		}

		if (hits.alerters) {
			alert("A setting change triggered this alert.");
		}

		// etc - most commonly some redraw will be required when a setting changes.
	},

};
