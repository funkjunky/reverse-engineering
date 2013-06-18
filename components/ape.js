
Crafty.c("Ape", {
	Ape: function() {
		this.requires("SpriteAnimation, Collision, Gravity")
			.animate("move_left", 0, 1, 3)
			.animate("move_right", 0, 2, 3)
			.gravity("solid")
			.bind("Moved", function(from) {
				if(this.hit('solid'))
					this.attr({x: from.x, y: from.y});
			/*
				if(this.x < from.x)	//going left
					if(!this.isPlaying("move_left"))
						this.stop().animate("move_left", 3, 1);
				if(this.x > from.x) //going right
					if(!this.isPlaying("move_right"))
						this.stop().animate("move_right", 3, 1);
			*/
			})
		return this;
	}
});


