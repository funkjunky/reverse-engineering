window.onload = function() {
	C.set({
		tile_width: 32,

		map_width: 15,
		map_height: 15,

		char_width: 32,
		char_height: 48,
	});

	Crafty.init(C('map_width') * C('tile_width'), C('map_height') * C('tile_width'));

	Crafty.scene("loading");
};
