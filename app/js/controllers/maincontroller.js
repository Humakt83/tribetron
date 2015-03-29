'use strict'

angular.module('Tribetron').controller('MainController', ['$scope', '$location', '$modal', 'Player', 'Campaign', function($scope, $location, $modal, Player, Campaign) {
	
	Campaign.reset()
	Player.reset()
	
	$scope.newCampaign = function() {
		$modal.open({
			templateUrl: './partials/player.html',
			controller: 'PlayerController'
		})
	}

	$scope.newRumble = function() {
		$location.path('/rumble')
	}
	
	$scope.help = function() {
		$modal.open({
			templateUrl: './partials/help.html',
			controller: 'HelpController'
		})
	}

}])

angular.module('Tribetron').controller('PlayerController', ['$scope', '$modalInstance', '$location', 'Player', function($scope, $modalInstance, $location, Player) {
	
	$scope.playerName = 'Thunder'
	$scope.teamName = 'Superions'
	
	$scope.continueToGame = function() {
		Player.createPlayer($scope.playerName, $scope.teamName)
		$location.path('/game')
		$modalInstance.close()
	}
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	}
}])

angular.module('Tribetron').controller('HelpController', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	
	$scope.ok = function() {
		$modalInstance.dismiss('ok')
	}
}])