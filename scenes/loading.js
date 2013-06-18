Crafty.scene("loading", function() {
	Crafty.sprite(32, "sprites/lametilesheet.png", {
		ground: [0,1],
		athing: [3,2]
	});

	Crafty.sprite("sprites/character.png", {
		playerleft: [0, 1*C('char_height'), C('char_width'), C('char_height')],
		playerright: [0, 2*C('char_height'), C('char_width'), C('char_height')],
		player: [0, 2*C('char_height'), C('char_width'), C('char_height')]
	});

	Crafty.load(["sprites/lametilesheet.png", "sprites/character.png"], function() {
		Crafty.scene("main");
	});

	Crafty.background("#000");
	Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
		.text("Loading")
		.css({ "text-align": "center" });
});
