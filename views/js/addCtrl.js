var addCtrl = angular.module('addCtrl', ['geolocation', 'mapdata']);

addCtrl.controller('addCtrl', function($scope, $http, geolocation, mapdata,$rootScope){

	//Initialize variables
	$scope.formData = {};
	var coords = {};
	var lat = 0;
	var lng = 0;

	//Set initial coordinates to the center of the US

	var latitude = 39.500;
	var longitude = -98.350;

	$scope.disasters=[
			{name:'Flood', value:'Flood'},
			{name:'Tornado', value:'Tornado'},
			{name:'Chemical', value:'Chemical'},
			{name:'Coastal Storm', value:'Coastal Storm'},
			{name:'Dam/Levee Break', value:'Dam/Levee Break'},
			{name:'Drought', value:'Drought'},
			{name:'Earthquake', value:'Earthquake'},
			{name:'Fire', value:'Fire'},
			{name:'Fishing Losses', value:'Fishing Losses'},
			{name:'Freezing', value:'Freezing'},
			{name:'Human Cause', value:'Human Cause'},
			{name:'Hurricane', value:'Hurricane'},
			{name:'Other', value:'Other'},
			{name:'Mud/Landslide', value:'Mud/Landslide'},
			{name:'Severe Ice Storm', value:'Severe Ice Storm'},
			{name:'Severe Storm(s)', value:'Severe Storm(s)'},
			{name:'Snow', value:'Snow'},
			{name:'Terrorist', value:'Terrorist'},
			{name:'Toxic Substances', value:'Toxic Substances'},
			{name:'Tsunami', value:'Tsunami'},
			{name:'Typhoon', value:'Typhoon'},
			{name:'Volcano', value:'Volcano'},
	];

	//Functions

	$scope.createQuery = function() {

		var QueryData = {
			disaster_type: $scope.formData.disaster_type,
			state: $scope.formData.state,
			date_from: $scope.formData.date_from,
			date_to: $scope.formData.date_to,		
		};

		$http.post('/history', QueryData)
			.success(function(data) {
				$scope.formData.disaster_type = "";
				$scope.formData.state = "";
				$scope.formData.date_from = "";
				$scope.formData.date_to = "";
				// Refresh the map with new data
				mapdata.refresh(latitude, longitude);

			})
			.error(function(data){
				console.log('Error: ' + data);
			});


	};
});