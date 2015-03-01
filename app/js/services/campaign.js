'use strict'

angular.module('Tribetron').factory('Campaign', ['$http', function($http) {
	
	return {
		getCampaign: function() {
			return $http.get('res/campaign.json');
		},
		getScenario: function(scenario) {
			return $http.get('res/' + scenario + '.json')
		}
	
	}
}])