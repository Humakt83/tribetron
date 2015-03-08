'use strict'

describe('Testing traps', function() {
	
	var trap
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Trap) {
		trap = Trap
	}))
	
	it('trap should be defined', function() {
		expect(trap).toBeDefined()
	})
	
	it('trap returns array of trap types', function() {
		expect(trap.getTrapTypes().length).toBeGreaterThan(0)
	})
	
	it('traps have cssName attribute', function() {
		angular.forEach(trap.getTrapTypes(), function(trapType) {
			expect(new trapType().cssName).toBeDefined()
		})
	})
	
	it('creates trap with type', function() {
		var trapObj = trap.createTrap(trap.getTrapTypes()[0])
		expect(trapObj).toBeDefined()
		expect(trapObj.trapType).toBeDefined()
		expect(trapObj.triggerTrap).toBeDefined()
	})
})