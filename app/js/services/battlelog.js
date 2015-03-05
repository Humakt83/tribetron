'use strict'

angular.module('Tribetron').factory('BattleLog', [function() {
	
	function BattleLog() {
		this.add = function(message) {
			this.log.splice(0, 0, message + '\n')
		}
		this.reset = function() {
			this.log = []
		}
		
		this.log = []
	}
	
	var battleLog = new BattleLog()
	
	return {
		getLog: function() {
			return battleLog
		},
		add: function(message) {
			battleLog.add(message)
		}
	}
}])