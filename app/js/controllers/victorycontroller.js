'use strict'

angular.module('Tribetron').controller('VictoryController', ['$scope', '$interval', '$location', 'Robot', function($scope, $interval, $location, Robot) {

	$scope.backToMain = function() {
		$interval.cancel($scope.imageDrawer)
		$location.path('/')
	}
	
	var botImages = ['colossusbot2', 'cratebot2', 'boxbot', 'lazorbot', 'player', 'titanbot', 'totterbot', 'multiplicatorbot', 'medicbot', 'nukabot']
	
	var canvas = angular.element('.victory-canvas')[0]
	var ctx = canvas.getContext('2d')
	
	$scope.imageDrawer = $interval( function() {
		function imageLoaded() {
			ctx.drawImage(image, Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), 25, 25)
		}
		var bot = botImages[Math.floor(Math.random() * botImages.length)]
		var image = angular.element('<img src="img/' + bot + '.png"/>')[0]
		image.onload = imageLoaded
	}, 250)
		
}])