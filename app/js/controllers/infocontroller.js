angular.module('Tribetron').controller('BotInfo', ['$scope', '$modalInstance', 'Player', 'Robot', 'botTypeName', function ($scope, $modalInstance, Player, Robot, botTypeName) {
	$scope.botTypeName = botTypeName
	angular.forEach(Robot.getTypesAsObjects(), function(robotType) {
		if (robotType.typeName == botTypeName) {
			$scope.robotDetails = Robot.getDetails(robotType)
		}
	})
	
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