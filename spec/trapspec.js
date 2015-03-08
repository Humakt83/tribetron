'use strict'

describe('Testing traps', function() {
	
	var trap
	
	var roboDummy = {
		stun : function(stunValue) {}, 
		receiveDamage : function(source, damage) {}
	}
	
	var areaDummy = {setTrap : function(trap) {}}
	
	beforeEach(module('Tribetron'))
	
	beforeEach(inject(function(Trap) {
		trap = Trap
		spyOn(areaDummy, 'setTrap')
		spyOn(roboDummy, 'receiveDamage')
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
	
	describe('Testing Mine', function() {
		
		it('causes damage to robot and disappears', function() {
			var trapObj = trap.createTrap(trap.getTrapTypes()[0])
			trapObj.triggerTrap(areaDummy, roboDummy)
			expect(trapObj.trapType.name).toEqual('Mine')
			expect(roboDummy.receiveDamage).toHaveBeenCalledWith(trapObj.trapType.name, trapObj.trapType.damage, undefined)
			expect(areaDummy.setTrap).toHaveBeenCalledWith()
		})
	})
	
	describe('Testing Stun Mine', function() {
		
		it('causes stun to robot and disappears', function() {
			spyOn(roboDummy, 'stun')
			var trapObj = trap.createTrap(trap.getTrapTypes()[1])		
			trapObj.triggerTrap(areaDummy, roboDummy)
			expect(trapObj.trapType.name).toEqual('Stun mine')
			expect(areaDummy.setTrap).toHaveBeenCalledWith()
			expect(roboDummy.receiveDamage).not.toHaveBeenCalled()
			expect(roboDummy.stun).toHaveBeenCalledWith(trapObj.trapType.stunTime)
		})
	})
	
	describe('Testing Plasma Pool', function() {
		
		it('causes damage to robot and stays', function() {
			var trapObj = trap.createTrap(trap.getTrapTypes()[2])
			trapObj.triggerTrap(areaDummy, roboDummy)
			expect(trapObj.trapType.name).toEqual('Plasma pool')
			expect(areaDummy.setTrap).not.toHaveBeenCalled();
			expect(roboDummy.receiveDamage).toHaveBeenCalledWith(trapObj.trapType.name, trapObj.trapType.damage, undefined)
		})
	})
})