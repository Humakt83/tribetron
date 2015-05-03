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
			.when('/pairs', {
				templateUrl: './partials/pairs.html',
				controller: 'PairsController'
			})
			.when('/venture', {
				templateUrl: './partials/venture.html',
				controller: 'VentureController'
			})
			.when('/conquest', {
				templateUrl: './partials/conquest.html',
				controller: 'ConquestController'
			})
			.when('/victory', {
				templateUrl: './partials/victory.html',
				controller: 'VictoryController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])