'use strict'

angular.module('Tribetron', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: './partials/game.html',
				controller: 'GameController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])