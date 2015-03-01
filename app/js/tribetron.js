'use strict'

angular.module('Tribetron', ['ngRoute', 'ngAnimate'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: './partials/game.html',
				controller: 'GameController'
			})
			.when('/shop', {
				templateUrl: './partials/shop.html',
				controller: 'ShopController'
			})
			.when('/test', {
				templateUrl: './partials/testgame.html',
				controller: 'TestGameController'
			})
			.when('/battle', {
				templateUrl: './partials/battle.html',
				controller: 'BattleController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])