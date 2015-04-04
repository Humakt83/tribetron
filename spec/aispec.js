'use strict'

describe('Testing AI', function() {
	
	var AIService
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(AI) {
		AIService = AI
	}))
	
	it('service should be defined', function() {
		expect(AIService).toBeDefined()
	})
	
	it('service returns an array of opponents', function() {
		expect(AIService.getOpponents().length).toBeGreaterThan(0)
	})
		
	it('returns opponent by name', function() {
		expect(AIService.getOpponentByName('aaaaaaaaaaaabareraw')).not.toBeDefined()
		expect(AIService.getOpponentByName('NPE')).toBeDefined()
		expect(AIService.getOpponentByName('Base')).toBeDefined()
	})
	
	it('creates opponent from given type', function() {
		expect(AIService.createOpponent(AIService.getOpponentByName('NPE'))).toBeDefined()
	})
	
	it('opponents have attributes defined', function() {
		angular.forEach(AIService.getOpponents(), function(type) {
			var opponent = AIService.createOpponent(type)
			expect(opponent.type.name).toBeDefined()
			expect(opponent.type.image).toBeDefined()
			expect(opponent.type.helloMessage).toBeDefined()
			expect(opponent.type.intelligence).toBeDefined()
			expect(opponent.type.taunts.length).toBeGreaterThan(0)
		})
	})
})