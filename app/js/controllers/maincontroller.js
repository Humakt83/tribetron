'use strict'

angular.module('Tribetron').controller('MainController', ['$scope', '$location', '$modal', 'Player', function($scope, $location, $modal, Player) {

	$scope.newCampaign = function() {
		Player.reset()
		$location.path('/game')
	}

	$scope.newRumble = function() {
		$location.path('/rumble')
	}
	
	$scope.help = function() {
		$modal.open({
			templateUrl: './partials/help.html',
			controller: 'HelpController'
		});
	}

}])

angular.module('Tribetron').controller('HelpController', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	
	$scope.ok = function() {
		$modalInstance.dismiss('cancel')
	}
}])