'use strict'

global.jQuery = require('jquery')
global._ = require('underscore')

require('bootstrap')

var angular = require('angular')

require('angular-animate')
require('angular-bootstrap')
require('angular-route')

angular.module('Tribetron', ['ngRoute', 'ngAnimate', 'ui.bootstrap'])
	.config(['$routeProvider', '$compileProvider', function($routeProvider, $compileProvider) {
        $compileProvider.debugInfoEnabled(false)
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
            .when('/custombattle', {
                templateUrl: './partials/battle.html',
                controller: 'CustomBattleController'
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
			.when('/chess', {
				templateUrl: './partials/chess.html',
				controller: 'ChessController'
			})
			.otherwise({
				redirectTo: '/'
			})
	}])

require('./services/abilities')
require('./services/ai')
require('./services/area')
require('./services/battlelog')
require('./services/campaign')
require('./services/game')
require('./services/graphics')
require('./services/loot')
require('./services/player')
require('./services/robo')
require('./services/settings')
require('./services/team')
require('./services/trap')
require('./services/saveload')

require('./controllers/maincontroller')
require('./controllers/gamecontroller')
require('./controllers/shopcontroller')
require('./controllers/rumblecontroller')
require('./controllers/battlecontroller')
require('./controllers/custombattlecontroller')
require('./controllers/pairscontroller')
require('./controllers/venturecontroller')
require('./controllers/conquestcontroller')
require('./controllers/victorycontroller')
require('./controllers/infocontroller')
require('./controllers/soundcontroller')
require('./chess/chesscontroller')

require('./chess/ai')
require('./chess/chessservice')

require('./directives/infoclick')
require('./directives/numberpicker')

require('./filters/spacify')
require('./filters/capitalize')
