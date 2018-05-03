var addCtrl = angular.module('addCtrl', ['geolocation', 'mapdata']);

addCtrl.controller('addCtrl', function($scope, $http, geolocation, mapdata){

	//Initialize variables
	$scope.formData = {};
	var coords = {};
	var lat = 0;
	var lng = 0;

	//Set initial coordinates to the center of the US

	$scope.formData.latitude = 39.500;
	$scope.formData.longitude = -98.350;

	//Functions

	$scope.createQuery = function() {

		var QueryData = {
			disaster_type: $scope.formData.disaster_type,
			state: $scope.formData.state,
			date_from: $scope.formData.date_from,
			date_to: $scope.formData.date_to,
			location: [$scope.formData.longitude, $scope.formData.latitude],		
		};

		$http.post('/history', QueryData)
			.success(function(data) {
				$scope.formData.disaster_type = "";
				$scope.formData.state = "";
				$scope.formData.date_from = "";
				$scope.formData.date_to = "";
				// Refresh the map with new data
				mapdata.refresh($scope.formData.latitude, $scope.formData.longitude);

			})
			.error(function(data){
				console.log('Error: ' + data);
			});

			};
});