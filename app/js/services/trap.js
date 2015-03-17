'use strict'

angular.module('Tribetron').factory('Trap', [function() {
	
	var trapTypes = [Mine, StunMine, PlasmaPool]
	
	function StunMine() {
		this.specialEffect = function(robot) {
			robot.stun(this.stunTime)
		}
		this.name = 'Stun mine'
		this.cssName = 'stun-mine'
		this.stunTime = 3
		this.jsonName = 'stunmine'
	}
	
	function PlasmaPool() {
		this.name = 'Plasma pool'
		this.cssName = 'plasma-pool'
		this.damage = 2
		this.permanent = true
		this.jsonName = 'plasma'
	}
	
	function Mine() {
		this.name = 'Mine'
		this.cssName = 'mine'
		this.damage = 5
		this.jsonName = 'mine'
	}
	
	function Trap(trapType) {
		this.triggerTrap = function(area, robot, map) {
			if (this.trapType.damage) robot.receiveDamage(this.trapType.name, this.trapType.damage, map)
			if (this.trapType.specialEffect) this.trapType.specialEffect(robot) 
			if (!this.trapType.permanent) {
				area.setTrap()
			}
		}
		this.trapType = trapType
	}
	
	return {
		getTrapTypes: function() {
			return trapTypes
		},
		createTrap: function(trapType) {
			return new Trap(new trapType())
		}
	
	}
}])