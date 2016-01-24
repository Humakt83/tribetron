'use strict'

angular.module('Tribetron').controller('SoundController', ['$scope', function($scope) {

	const tribetronMp3 = new Audio('Tribetron.mp3')

	$scope.playingMp3 = false
	$scope.playImg = 'img/soundOn.png'

    $scope.toggleSound = function() {
    	$scope.playingMp3 = !$scope.playingMp3
		if (!$scope.playingMp3) {
			tribetronMp3.pause()
			tribetronMp3.currentTime = 0.0
			$scope.playImg = 'img/soundOn.png'
		} else {
			tribetronMp3.play()
			$scope.playImg = 'img/soundOff.png'
		}
	}

}])