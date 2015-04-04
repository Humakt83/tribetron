'use strict'

describe('Testing loot', function() {
	
	var lootService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Loot) {
		lootService = Loot
	}))
	
	it('service should be defined', function() {
		expect(lootService).toBeDefined()
	})
	
	it('service returns an array of loot', function() {
		expect(lootService.getLootTypesAsObjects().length).toBeGreaterThan(0)
	})
	
	it('loot types have goal, pickupmessage and names defined', function() {
		angular.forEach(lootService.getLootTypesAsObjects(), function(loot) {
			expect(loot.name).toBeDefined()
			expect(loot.cssName).toBeDefined()
			expect(loot.pickupMessage).toBeDefined()
			expect(loot.goal).toBeDefined()
		})
	})
	
	it('treasure is a goal', function() {
		var treasure = _.find(lootService.getLootTypesAsObjects(), function(loot) { return loot.name === 'Treasure' })
		expect(treasure.goal).toBeTruthy()
	})
	
})