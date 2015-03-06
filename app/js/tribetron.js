'use strict'

angular.module('Tribetron', ['ngRoute', 'ngAnimate', 'ui.bootstrap'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: './partials/main.html',
				controller: 'MainController'
			})
			.when('/game', {
				templateUrl: './partials/game.html',
				controller: 'GameController'
			})
			.when('/shop', {
				templateUrl: './partials/shop.html',
				controller: 'ShopController'
			})
			.when('/rumble', {
				templateUrl: './partials/rumble.html',
				controller: 'RumbleController'
			})
			.when('/battle', {
				templateUrl: './partials/battle.html',
				controller: 'BattleController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])