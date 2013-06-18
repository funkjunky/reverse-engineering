/**@
* #TiledMapBuilder
* @category Graphics
* A Tiled map (http://mapeditor.org) importer for Crafty.js ( http://craftyjs.com)
* It creates a tiled world or view on the basis of exported JSON file from Tiled Map Editor.
* It also provides methods to access to tiles, layers, tilesets, rendering views of map, lazy loading,...
*
* @see http://www.mapeditor.org/ - Tiled Map Editor
* @author Tomas Jurman (tomasjurman@gmail.com)
*/
Crafty.c("TiledMapBuilder", {  	  				
		
	tileMapBuilderSetting: {
		 USE_WEB_WORKERS		:false,
		 PATH_TO_WORKER_SCRIPT	:'../../modules/create_mocks_module.js',		
		 RENDER_METHOD_CANVAS	:'Canvas',
	     RENDER_METHOD_DOM		:'DOM',	    
	 },
	
	_renderMethod: null,
	_isometric:null,
	_layers: null,	
	_callback:null,
    init: function() {    			    	  			    
    	this._renderMethod = this.has(this.tileMapBuilderSetting.RENDER_METHOD_CANVAS) ? 
    			this.tileMapBuilderSetting.RENDER_METHOD_CANVAS : 
    			this.tileMapBuilderSetting.RENDER_METHOD_DOM;	
    			    	
    	return this;
    },
        
    /**@
	 * #TiledMapBuilder.setMapDataSource
	 * Set a data source for tiled map.
	 * 
	 * @param {Object} source - object from JSON file exported by Tiled Map Editor		
	 * @throws {Error} - when source is not valid 	
	 * @return {Object} this
	 *   
	 * @see http://www.mapeditor.org/ - Tiled Map Editor, export to JSON			 
	 */
    setMapDataSource:function( source ){
    	if(!this.isValid(source)){    	
    		throw new Error("Source is not valid.");    		
    	}
    	
    	this._source = source;
    	
    	if( this.isIsometric() ){
    		this.setIsometric( source );
    	}
    	
    	this.createTiles( source );
    	
    	return this;
    },
    
    /**@
	 * #TiledMapBuilder.createWorld
	 * Renders a tiled world based on the source file.
	 * 	
	 * @param {Function} callback - callback function call when world is done 	
	 * @return {Object} this   	 	
	 */
    createWorld: function( callback ) {     	    	       	
    	return this.createView( 0, 0, this._source.width, this._source.height, callback );
	},
	
	/**@
	 * #TiledMapBuilder.createView
	 * Renders a tiled view based on the source file.
	 * 	
	 * @param {Integer} startRow - start row, start from 0 to N
	 * @param {Integer} startColumn - start column, start from 0 to N
	 * @param {Integer} viewWidth - view width in tiles 
	 * @param {Integer} viewHeight - view height in tiles
	 * @param {Function} callback - callback function call when world is done	
	 * @return {Object} this   			
	 */
	createView: function( startRow, startColumn, viewWidth, viewHeight, callback ){			
		this._callback = callback;
				
		if( this.tileMapBuilderSetting.USE_WEB_WORKERS && typeof(Worker)!=="undefined"){								
			this.doInBackground({startRow:startRow, startColumn:startColumn, viewWidth:viewWidth, viewHeight:viewHeight, renderMethod:this._renderMethod, source:this._source});
			
		}else{		
			// Do not forget attach module: <script src="path/to/create_mocks_module.js"></script>
			MockModule.init( startRow, startColumn, viewWidth, viewHeight, this._renderMethod, this._source );
			this._layers = this.createEntitiesFromMock( MockModule.createMockEntities() );	
			this.fireCallback();			
		}
		
    	return this;    	
    },
    
    /**@
	 * #TiledMapBuilder.lazyLoadingForEntity
	 * Is rendering a lazy tiled views based on the player entity.
	 * 	
	 * @param {Object} entity, Crafty.e	
	 * @return {Object} this   			
	 */
    lazyLoadingForEntity: function( entity ){
    	new Error("NotSupportedException");  	
    },
    
	/**@
	 * #TiledMapBuilder.getLayer
	 * Contains all tiles as Crafty.entity in layer
	 * 
	 * @param	{String} layerName - name of layer, The name will be defined in the Tiled Map Editor
	 * @return	{Array} entities
	 *
	 * @see http://www.mapeditor.org/ - Tiled Map Editor		
	 */
	getEntitiesInLayer:function( layerName ){ 	
		if(!this.isLayer( layerName )){
			return null;
		}
				
		var entities = [];		
		for( var idx = 0; idx < this._layers[layerName].length; idx++){
			if( this._layers[layerName][idx] != 0 ){
				entities.push( this._layers[layerName][idx] );
			};					
		}
		
		return entities;
	},
	
	/**@
	 * #TiledMapBuilder.getTile	
	 *
	 * @param	String layerName - number of layer
	 * @param	Integer row - number of row from tiled matrix, range: 0-n	
	 * @param	Integer column - number of column from tiled matrix, range: 0-n	
	 * @return	Object<Crafty.e> tile 
	 */
	getTile: function( row, column, layerName ){		
		if(!this.isLayer( layerName )){
			return null;
		}
		
		return this._layers[layerName][MockModule.getTileIndex( row, column, this.getLayerFromSource(layerName))];
	},
		
	/**@
	 * #TiledMapBuilder.getLayers	
	 * Object with layerNames as key and Array of loaded Entities as value
	 * Key - layerName
	 * Value - Array<Etities>
	 * 
	 * @return {Object} layers		
	 */
    getLayers: function(){
    	return this._layers;
    },
		
	 /**@
	 * #TiledMapBuilder.getRenderMethod 	
	 *
	 * @example
	 * RenderMethod depends on parent Entity:
	 * ~~~	
	 * Crafty.e("2D, Canvas, TiledMapBuilder")
	 * return -> Canvas	 
	 * 	 
	 * Crafty.e("2D, DOM, TiledMapBuilder")
	 * return -> DOM	 
	 * ~~~
	 * 
	 * @return	String renderMethod - DOM or Canvas				
	 */
    getRenderMethod: function(){
    	return this._renderMethod;
    },
    
    /**@
	 * #TiledMapBuilder.getSource	
	 * 
	 * @return	Object source	
	 * @see TiledMap.load 			
	 */
    getSource: function(){
    	return this._source;
    },
        
    /**@
	 * #TiledMapBuilder.getIsometric
	 * 
	 * @return Object Crafty.isometric or null if map is not isometric
	 * 
	 * @see http://craftyjs.com/api/Crafty-isometric.html		
	 */
    getIsometric:function(){
    	return this._isometric;
    },
    
    /**@
	 * #TiledMapBuilder.isIsometric
	 * 
	 * @return	boolean true or false		
	 */
    isIsometric:function(){
    	return this._source.orientation == MockModule.settings.ISOMETRIC_DIAMOND || 
    		this._source.orientation == MockModule.settings.ISOMETRIC_STAGGERED;
    },
    
    /**@
	 * #TiledMapBuilder.getOrientation
	 * Map orientation.
	 * 
	 * @return {String} (orthogonal || isometric || staggered)		
	 */
    getOrientation:function(){
    	return this._source.orientation;
    },
           
	/*
	 * Validate source object
	 * 
	 * @param {Object} source - object from JSON file exported by Tiled Map Editor	
	 * @return {boolean} true or false
	 */
	isValid: function( source ){
		var isValid = true;
				
		if(!source || 											// is not undefined
		   !(source.width && source.height) ||					// has width and height property
		   !(source.layers && source.layers.length >=1) ||		// has no empty layer property
		   !(source.tilesets && source.tilesets.length >=1)){	// has no empty tilesets property
			isValid = false;
		}
		
		return isValid;
	},
	
	/*
	 * Create Crafty.sprite() for each source image	
	 * 
	 * @param {Object} source - object from JSON file exported by Tiled Map Editor	
	 * @return {Object} this
	 */
	createTiles: function( source ){		
		for(var idx = 0; idx < source.tilesets.length; idx++ ){
			this.createSprite( source.tilesets[idx] );			
		};		
	},
	
	/*
	 * Create Crafty.sprite() from tileset	
	 * 
	 * @param {Object} tileset	
	 * @return {Object} Crafty.sprite()
	 * 	
	 * @see http://craftyjs.com/api/Crafty-sprite.html - Crafty.sprite() documentation
	 */
	createSprite:function( tileset ){		
		return Crafty.sprite(tileset.tilewidth, tileset.tileheight, tileset.image, this.arrangeTiles( tileset ), tileset.margin, tileset.margin);										
	},
	
	/*
	 * Create tiles map from tileset
	 * Every tile´s name is: 'Tile' + index
	 *  
	 * @param {Object} tileset	
	 * @return {Object} map - {tile1:[posX, posY], tile2:[posX, posY], ...}	
	 */
	arrangeTiles:function(tileset){	
			
		var numberOfColumns = Math.round(tileset.imagewidth / (tileset.tilewidth+tileset.margin));
	    var numberOfRows = Math.round(tileset.imageheight / (tileset.tileheight+tileset.margin));
		
		var tilesMap = {};		
		for(var row = 0; row < numberOfRows; row++ ){
			
			for( var column = 0; column < numberOfColumns; column++ ){								
				var name = "Tile" + ((parseInt(tileset.firstgid) + column) + (numberOfColumns * row ));								
				tilesMap[name] = [column, row];
			};			
		}	
				
		return tilesMap;
	},
	
	 /*
	 * #TiledMapBuilder.setIsometric
	 * Create Crafty.isometric object and set it as private field.
	 * 
	 * @param {Object} source - object from JSON file exported by Tiled Map Editor			
	 */
    setIsometric:function( source ){
    	this._isometric = Crafty.isometric.size(source.tilewidth, source.tileheight);
    },
			
	/*
	 * Create Crafty.entities from mock
	 *  
	 * @param {Object} mockEntities, keys are layerName, contains MockObject or 0	
	 * @return {Object} entities, {layer1Name:entities, layer2Name: entities, ...}
	 */
    createEntitiesFromMock:function( mockEntities ){ //TODO - refactor method
    	var layers = {};
    	
    	var isIsometric = this.isIsometric();
    	var isometric = this.getIsometric();
    	for (var layer in mockEntities) { 
    		layers[layer] = [];
    		 for(var idx = 0; idx < mockEntities[layer].length; idx++ ){
    			 var mockEntity = mockEntities[layer][idx];
    			 if( mockEntity == 0 ){
    				 layers[layer].push(0);
				}else{    					    				
					var entity = Crafty.e( mockEntity.head ).attr({ x:mockEntity.x, y:mockEntity.y });
	    			if( isIsometric ){
	    				isometric.place( entity.x, entity.y, 0, entity);	
	    			}    			     			
	    			layers[layer].push( entity );
				}    			     			     			     			     
    		 }    		
    	}    	    	   
    	return layers;
    },
			
	/*
	 * Determine if layer with layerName exists
	 * 
	 * @param String layerName	
	 * @return boolean
	 */
	isLayer: function( layerName){
		return this._layers[layerName] ? true : false;
	},
	
	/*
	 * Get Layer object from source object
	 * Source object is object from JSON file exported by Tiled Map Editor
	 * 
	 * @param {String} layerName		
	 * @return {Object} layer
	 */
	getLayerFromSource:function(layerName){
		for(var idx = 0; idx < this._source.layers.length; idx++){
			if(this._source.layers[idx].name == layerName){
				return this._source.layers[idx];
				break;
			}
		}
		return null;				
	},	
	
	  /*
     * Do task in background thread
     * 
     * @param {Object} data, {startRow:startRow, startColumn:startColumn, viewWidth:viewWidth, viewHeight:viewHeight, renderMethod:renderMethod, source:source}
     * @param {Function} callback - callback function call when world is done 
     */
    doInBackground:function( data ){
    	var self = this;
		var worker = new Worker(this.tileMapBuilderSetting.PATH_TO_WORKER_SCRIPT);				
		worker.postMessage(data);
		worker.onmessage = function (e) {
			self._layers = self.createEntitiesFromMock( e.data );	
			self.fireCallback();							
		};
		
		worker.onerror = function(error) {		      
			throw error;
		};
    },
    
    /*
     * It fires defined callback function   
     */
    fireCallback: function(){    		
		if(typeof this._callback != 'undefined'){
    		this._callback.call(this, this);
    	}
    },
});


onmessage = function(e) {
	MockModule.init(e.data.startRow, e.data.startColumn, e.data.viewWidth, e.data.viewHeight, e.data.renderMethod, e.data.source);		
	postMessage(MockModule.createMockEntities());   
};

/**
* Create mock entities for TiledMapBuilder
* 
* @class MockModule
* @author Tomas Jurman (tomasjurman@gmail.com)
* @see TiledMapBuilder (https://github.com/Kibo/TiledMapBuilder)
*/
MockModule = {
	_startRow:null,
	_startColumn:null,
	_viewWidth:null,
	_viewHeight:null,
	_renderMethod:null,
	_source:null,
		
	settings: {
		ISOMETRIC_DIAMOND	:'isometric',
		ISOMETRIC_STAGGERED	:'staggered',
		ORTHOGONAL			:'orthogonal',		
	},
		
	/**
	 * Constructor for module
	 * 	
	 * @param {Integer} startRow - start row, start from 0 to N
	 * @param {Integer} startColumn - start column, start from 0 to N
	 * @param {Integer} viewWidth - view width in tiles 
	 * @param {Integer} viewHeight - view height in tiles
	 * @param {String} renderMethod, [ DOM | Canvas ]
	 * @param {Object} source - object from JSON file exported by Tiled Map Editor
	 * @return {Object} this 
	 */
	init: function( startRow, startColumn, viewWidth, viewHeight, renderMethod, source ) { 
		this._startRow = startRow;
		this._startColumn = startColumn;
		this._viewWidth = viewWidth;
		this._viewHeight = viewHeight;
		this._renderMethod = renderMethod;
		this._source = source;
		
	    return this;
	},
	
	/**
	 * Create MockEntities
	 *  
	 * @return {Object} layers, {layer1name:[entities], layer1name:[entities], ...}		
	 */
	createMockEntities: function(){
		var layers = {};
		for(var layer = 0; layer < this._source.layers.length; layer++){
			var entities = this.createMockEntitiesInLayer( this._source.layers[layer] );
			layers[this._source.layers[layer].name] = entities;			
		}	
		
		return layers;		
	},
	
	/*
	 * Create MockEntities in layer
	 *	 
	 * @param {Object} layer
	 * @return {Array} entities		
	 */
	createMockEntitiesInLayer: function( layer ){			
		var indexes = this.getIndexes( layer );
		
		var entities = [];
		for(var i = 0; i < indexes.length; i++){	
			
			if( layer.data[indexes[i]] == 0 ){
				entities.push(0);
			}else{											
				entities.push( this.createMockEntity( layer, indexes[i] ) );
			}						
		}				
		return entities;
	},
	
    /*
	* Return index of every tile in source data
	* 		
	* @param {Object} layer
	* @return {Array} indexes - [0,1,10,11,12,15,20,21,22,23,24,25,26]	
	*/
    getIndexes:function( layer ){    	
    	var idxs = [];
    	
    	for(var row = this._startRow ; row < (this._startRow + this._viewHeight); row++ ){
    		var indexOfStartTile = this.getTileIndex(row, this._startColumn, layer);     		
    		idxs = idxs.concat(  this.makeSequence(indexOfStartTile, indexOfStartTile + this._viewWidth));    		
    	}    	   
    	return idxs;
    },
    
    /*
	 * Create MockEntity
	 * 	
	 * @param {Object} layer
	 * @param {Integer} dataIndex	
	 * @return {Object} mock, {head:String, x:number, y:number} 
	 */
	createMockEntity:function( layer, dataIndex){			
		var column = dataIndex % layer.width;
		var row = Math.floor((dataIndex / layer.width));								
		var mock = {head:"2D," + this._renderMethod + ",Tile" + layer.data[dataIndex] + "," + layer.name};	
		this.setPosition( column, row, mock );				
		return mock;
	},
	
	/*
	 * Set position of entity
	 * 	
	 * @param {Integer} column
	 * @param {Integer} row	 	
	 * @param {Object} mockEntity 
	 */
	setPosition:function( column, row, mockEntity){
		
		switch( this._source.orientation ){
			
			case this.settings.ORTHOGONAL:
				mockEntity.x = column * this._source.tilewidth;
				mockEntity.y = row * this._source.tileheight;
				break;
			
			case this.settings.ISOMETRIC_DIAMOND:				
				var left = (column - row) * (this._source.tilewidth/2);
				var top = (column + row) * (this._source.tileheight/2);												
				var position = this.px2pos(left, top, this._source);
				mockEntity.x = position.x;
				mockEntity.y = position.y;				
				break;
				
			case this.settings.ISOMETRIC_STAGGERED:
				mockEntity.x = column;	
				mockEntity.y = row;
				break;
											
			default:
				throw new Error("Orientation of map " + this._source.orientation + "is not supported.");
		}
	},
    
    /*
	* Create sequence of numbers
	* from is in
	* to is out
	* 
	* @param {Integer} from
	* @param {Integer} to
	* @return {Array} indexes - [0,1,2,3,4,5,6,7,8,9,..]	
	*/
    makeSequence:function(from, to){       	    
    	var numbers = [];       
    	for(var idx = from; idx < to; idx++){
    		numbers.push(idx);
    	}    	      
    	return numbers;	
    }, 
    
    /*
	 * Get index of tile from layer
	 * 	 
	 * @param {Integer} row, start from 0 to N
	 * @param {Integer} column, start from 0 to N
	 * @param {Object} layer	
	 * @return {Integer} index
	 */
	getTileIndex:function( row, column, layer){			
		return ((layer.width) * row) + column;	
	},
	
	/*
	 * Convert px to position in staggered map
	 * 	
	 * @param {Integer} left
	 * @param {Integer} top 
	 * @return {Object} position {x:number, y:number}
	 */
	px2pos:function( left, top, source){
		return{
			x:-Math.ceil(-left / source.tilewidth - (top%2) * 0.5),
            y:top / source.tileheight * 2
		};
	},
};
