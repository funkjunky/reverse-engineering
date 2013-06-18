
	Crafty.scene("main", function() {
		var map = Crafty.e("2D, DOM, TiledMapBuilder").setMapDataSource(SOURCE_FROM_TILED_MAP_EDITOR);
		map.createWorld( function(map) {
			//set the types for the tiles
			console.log(map.getEntitiesInLayer('platforms'));
			var platforms = map.getEntitiesInLayer('platforms');
			for(var i = 0; i < platforms.length; ++i)
			{
				platforms[i]
					.addComponent("solid");
			}

			//load the player
			var player1 = Crafty.e("2D, DOM, Ape, player, Twoway")
				.attr({ x: 1 * C('tile_width'), y: (C('map_height')-8) * C('tile_width'), z: 1 })
				.twoway(2, 6)
				.Ape();
		});
	});


