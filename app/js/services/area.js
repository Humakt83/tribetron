'use strict'

angular.module('Tribetron').factory('AreaMap', ['$filter', function($filter) {
	function Area(xCoord, yCoord, isWall) {
		this.xCoord = xCoord
		this.yCoord = yCoord
		this.isWall = isWall
	}
	
	function Map(areas, width, heigth) {
		this.getAreasByRow = function(row) {
			return $filter('filter')(areas, {'yCoord':row}, 'xCoord')
		}
		this.areas = areas
		this.lines = new Array(width)
		this.rows = new Array(heigth)
	}
	
	return {
		createMap : function(width, heigth) {
			var areas = []
			for (var y = 0; y < heigth; y++) {
				for (var x = 0; x < width; x++) {
					if ( y === 0 || x === 0 || y === heigth-1 || x === heigth -1)
						areas.push(new Area(x, y, true))
					else
						areas.push(new Area(x, y))
				}
			}
			return new Map(areas, width, heigth)
		}
	}
}])