'use strict'

angular.module('Tribetron').factory('Team', ['$filter', 'Robot', function($filter, Robot) {
	
	function BotsByType(typeName, amount) {
		this.typeName = typeName
		this.amount = amount
	}
	
	function Team(name, robots, isEnemy) {
		
		this.containsBot = function(robot) {
			return this.robots.indexOf(robot) > -1
		}
		
		this.updateBotCount = function() {
			this.botsByTypeAlive = this.botsPerTypeRemaining()
		}
		
		this.botsRemaining = function() {
			return $filter('filter')(this.robots, {'destroyed': false}).length
		}
		
		this.botsPerTypeRemaining = function() {
			var botsPerType = [], thisTeam = this
			angular.forEach(Robot.getTypes(), function(type) {
				var botType = new type()
				botsPerType.push(new BotsByType(botType.typeName, $filter('filter')(thisTeam.robots, function(bot) {
					return bot.type.typeName === botType.typeName && !bot.destroyed
				}).length))
			})
			return botsPerType
		}
		
		this.robots = robots
		this.isEnemy = isEnemy
		this.name = name
		this.botsByTypeAlive = this.botsPerTypeRemaining()
		var thisTeam = this
		angular.forEach(robots, function(robo) {
			robo.setTeam(thisTeam)
		})
	}
	return {
		createTeam : function (name, robots, isEnemy) {
			return new Team(name, robots, isEnemy)
		}
	}
}])