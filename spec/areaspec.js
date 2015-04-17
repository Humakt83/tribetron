'use strict'

describe('Testing Areas and Map', function() {

	var areaService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(AreaMap) {
		areaService = AreaMap
	}))
	
	it('service is defined', function() {
		expect(areaService).toBeDefined()
	})
	
	it('creates coord with given x and y', function() {
		var x = 5, y = 7
		var coord = areaService.createCoord(x, y)
		expect(coord.x).toEqual(x)
		expect(coord.y).toEqual(y)
	})
	
	it('creates map with given dimensions', function() {
		var width = 10, height = 9
		var map = areaService.createMap(width, height)
		expect(map.width).toEqual(width)
		expect(map.height).toEqual(height)
		expect(map.lines.length).toEqual(width)
		expect(map.rows.length).toEqual(height)
		expect(map.areas.length).toEqual(width * height)
	})
	
	it('map is surrounded by walls', function() {
		function areasAreWalls(areas) {
			angular.forEach(areas, function(area) {
				expect(area.isWall).toBeTruthy()
			})
		}
		var width = 5, height = 7
		var map = areaService.createMap(width, height)
		areasAreWalls(map.getAreasByRow(0))
		areasAreWalls(map.getAreasByRow(height - 1))
		areasAreWalls(map.getAreasByColumn(0))
		areasAreWalls(map.getAreasByColumn(width - 1))
	})
	
	it('everything else is not a wall in map', function() {
		var width = 3, height = 4
		var map = areaService.createMap(width, height)
		expect(map.getAreaByCoord(areaService.createCoord(1, 1)).isWall).toBeFalsy()
		expect(map.getAreaByCoord(areaService.createCoord(1, 2)).isWall).toBeFalsy()
	})

})