'use strict'

describe('Testing bots', function() {
	
	var robotService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Robot) {
		robotService = Robot
	}))
	
	it('robot should be defined', function() {
		expect(robotService).toBeDefined()
	})
	
	it('service returns array of robot types', function() {
		expect(robotService.getTypes().length).toBeGreaterThan(0)
	})
	
	it('bot types have maxHealth, description, level requirement and price attributes', function() {
		angular.forEach(robotService.getTypes(), function(botType) {
			expect(new botType().maxHealth).toBeDefined()
			expect(new botType().price).toBeDefined()
			expect(new botType().description).toBeDefined()
			expect(new botType().levelRequirement).toBeDefined()
		})
	})
	
	it('creates robot with type', function() {
		var type = robotService.getTypes()[0]
		var bot = robotService.createRobot(new type())
		expect(bot).toBeDefined()
		expect(bot.currentHealth).toBeDefined()
		expect(bot.type).toBeDefined()
	})

})