'use strict'

angular.module('Tribetron').controller('BotInfo', ['$scope', '$modalInstance', 'Player', 'Robot', 'botTypeName', function ($scope, $modalInstance, Player, Robot, botTypeName) {
	
	$scope.botTypeName = botTypeName
	
	if (botTypeName === 'avatar') {
		$scope.robotDetails = Robot.getDetails(Player.getPlayer().avatar.type)
		$scope.description = Player.getPlayer().avatar.type.description
	} else {
		angular.forEach(Robot.getTypesAsObjects(), function(robotType) {
			if (robotType.typeName == botTypeName) {
				$scope.robotDetails = Robot.getDetails(robotType)
				$scope.description = robotType.description
			}
		})
	}
	
    $scope.cancel = function () {
		$modalInstance.dismiss('cancel')
    }
	
}])

angular.module('Tribetron').factory('InfoOpener', ['$modal', function($modal) {
	return {
		openBotInfo: function(event) {
			$modal.open({
				templateUrl: './partials/botinfo.html',
				controller: 'BotInfo',
				size: 'sm',
				resolve: {
					botTypeName: function () {
						return angular.element(event.target).attr('ng-bot')
					}
				}
			})
		}
		
	}
}])