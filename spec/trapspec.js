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
})