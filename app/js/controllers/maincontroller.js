'use strict'

angular.module('Tribetron').controller('MainController', ['$scope', '$location', '$modal', 'Player', 'Campaign', function($scope, $location, $modal, Player, Campaign) {
	
	Campaign.reset()
	Player.reset()
	
	$scope.newCampaign = function() {
		$modal.open({
			templateUrl: './partials/player.html',
			controller: 'PlayerController',
			size: 'sm'
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
	
	$scope.video = function() {
		var element = angular.element('<iframe width="560" height="315" src="https://www.youtube.com/embed/IvXx1uRfhOw" frameborder="0" allowfullscreen></iframe>')
		angular.element('.battle-image').append(element)
		$scope.videoShown = true;
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