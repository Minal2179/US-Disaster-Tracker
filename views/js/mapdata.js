angular.module('mapdata', []).factory('mapdata', function($http, $rootScope){

    //Initialize variables
    var googleMapService = {};

    //Array of locations 
    var locations = [];

    //Selected location
    var selectedLat = 39.50;
    var selectedLng = -98.35;


    //Functions
    googleMapService.refresh = function(latitude, longitude){

        locations = [];

        selectedLat = latitude
        selectedLng = longitude;

          //perform an AJAX call to get all records
        $http.get('/history').success(function(response){
            var latest_query = response[response.length -1];
            var myLatLng = {lat: selectedLat, lng: selectedLng};
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 4,
                center: myLatLng
            });
            convertToMapPoints(latest_query, function(filteredresult){
                initialize(latitude, longitude, filteredresult, map);
            });

        }).error(function(){});

    };

    //get Map points for each of the disaster instances
    var convertToMapPoints = function(response, callback){
        var locations = [];
        console.log(response);
        console.log("Step 1");
        var statefilter = null;
        var disasterfilter = null;
        var incidentBeginDatefilter = null;
        var incidentEndDatefilter = null;
        var query='';
        if(response.state){
            statefilter = "state eq '"+response.state+"'";
        }
        if(response.disaster_type){
            if(statefilter)
                disasterfilter = "and incidentType eq '"+response.disaster_type+"'";
            else
                disasterfilter = "incidentType eq '"+response.disaster_type+"'";
        }
        if(response.date_from){
            if(statefilter || disasterfilter)
                incidentBeginDatefilter = "and incidentBeginDate ge '"+response.date_from+"'";
            else
                incidentBeginDatefilter = "incidentBeginDate ge '"+response.date_from+"'";
        }
        if(response.date_to){
            if(statefilter || disasterfilter || incidentBeginDatefilter)
                incidentEndDatefilter = "and incidentEndDate le '"+response.date_to+"'";
            else
                incidentEndDatefilter = "incidentEndDate le '"+response.date_to+"'";
        }
        if(statefilter!=null){
            query = query+statefilter;
        }
        if(disasterfilter!=null){
            query = query+disasterfilter;
        }
        if(incidentEndDatefilter!=null){
            query = query+incidentEndDatefilter;
        }
        if(incidentBeginDatefilter!=null){
            query = query+incidentBeginDatefilter;
        }

        //get Filtered FEMA data via api
        $http.get('https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter='+query)
        .success(function(results) {
            $rootScope.disasterReport = results.DisasterDeclarationsSummaries;
            console.log("Step 2");
            var disasterSummary = results.DisasterDeclarationsSummaries;
            console.log(disasterSummary);

            //Loop over each of the disasters to pinpoint on map
            for (var i = 0; i < disasterSummary.length; i++) {
                var county;
                if(disasterSummary[i].declaredCountyArea){
                    if(disasterSummary[i].declaredCountyArea.indexOf('(District)') >=0)
                        county = disasterSummary[i].declaredCountyArea.split(' (District)');
                    if(disasterSummary[i].declaredCountyArea.indexOf('(County)') >=0)
                        county = disasterSummary[i].declaredCountyArea.split(' (County)');
                    if(disasterSummary[i].declaredCountyArea.indexOf('(Island)') >=0)
                        county = disasterSummary[i].declaredCountyArea.split(' (Island)');
                }
                if(county)
                    address = county[0]+","+disasterSummary[i].state;
                else
                    address = disasterSummary[i].state;
                //Calling function to get coordinates
                var lat, lng;
                getCoords(disasterSummary[i], address, function(report, eachloc){
                    // console.log(eachloc[0]+" "+eachloc[1]);
                    // console.log(report);
                    lat = eachloc[0];
                    lng = eachloc[1];
                    
                    var  contentString =
                    '<p><b>State</b>: ' + report.state +
                    '<br><b>County</b>: ' + report.declaredCountyArea +
                    '<br><b>Latitude</b>: ' + lat +
                    '<br><b>Longitude</b>: ' + lng +
                    '<br><b>Title</b>: ' + report.title +
                    '<br><b>Disaster</b>: ' + report.incidentType +
                    '<br><b>Date From</b>: ' + report.incidentBeginDate +
                    '<br><b>Date To</b>: ' + report.incidentEndDate +
                    '</p>';

                    // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                    var place = {
                        latlon: new google.maps.LatLng(eachloc[0], eachloc[1]),
                        message: new google.maps.InfoWindow({
                            content: contentString,
                            maxWidth: 320
                        }),
                        state: report.state,
                        county: report.declaredCountyArea,
                        title: report.title,
                        disaster: report.incidentType,
                        date_from: report.incidentBeginDate,
                        date_to: report.incidentEndDate
                    };

                    callback(place);

                });
            }

            // callback(locations);
                
        })
        .error(function(){
            console.log("Step 6");
            console.error("Error generated");
        })
        .finally(function(){
            
        });
    };



    var getCoords = function(report, address, coordcallback) {
        var LatLng = [];
        var googleLatlang;
        // console.log(address);
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyCVonx72WOIIz2UW_L8Unp4P7E5Ob2bryk')
        .success(function(latlng){
            console.log("Step 3");
            // googleLatlang = new google.maps.LatLng(latlng.results[0].geometry.location.lat, latlng.results[0].geometry.location.lng)
            var LatLng = [];
            console.log(latlng);
            LatLng[0] = latlng.results[0].geometry.location.lat;
            LatLng[1] = latlng.results[0].geometry.location.lng;
            coordcallback(report, LatLng);
        })
        .error(function(){
            console.log("Step 5");
            console.error("API couldn't work well");
        });  
    }

    var icon=[
        {disaster: 'Chemical', icon: '/../icon/chemical.png'},
        {disaster: 'Coastal Storm', icon: '../icon/storm.png'},
        {disaster: 'Dam/Levee Break', icon: '../icon/dam.png'},
        {disaster: 'Drought', icon: '../icon/drought.png'},
        {disaster: 'Earthquake', icon: '/../icon/earthquake.png'},
        {disaster: 'Fire', icon: '../icon/fire.png'},
        {disaster: 'Fishing Losses', icon: '../icon/fish.png'},
        {disaster: 'Flood', icon: '../icon/flood.png'},
        {disaster:'Freezing', icon:'../icon/freezer.png'},
        {disaster:'Human Cause', icon:'../icon/human.png'},
        {disaster:'Hurricane', icon:'../icon/tornado.png'},
        {disaster:'Other', icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'},
        {disaster:'Mud/Landslide', icon:'../icon/landslide.png'},
        {disaster:'Severe Ice Storm', icon:'../icon/storm.png'},
        {disaster:'Severe Storm(s)', icon:'../icon/storm.png'},
        {disaster:'Snow', icon:'../icon/snow.png'},
        {disaster:'Terrorist', icon:'../icon/terrorist.png'},
        {disaster:'Tornado', icon:'../icon/tornado.png'},
        {disaster:'Toxic Substances', icon:'../icon/toxic.png'},
        {disaster:'Tsunami', icon:'../icon/tsunami.png'},
        {disaster:'Typhoon', icon:'../icon/tornado.png'},
        {disaster:'Volcano', icon:'../icon/volcano.png'},
    ]
    // Initializes the map
    var initialize = function(latitude, longitude, places, map) {

        // Uses the selected lat, long as starting point
        var myLatLng = {lat: selectedLat, lng: selectedLng};

        console.log(places);

        // Loop through each location in the array and place a marker
        console.log("I am in initialize");
        console.log(places.latlon);
        var disaster_icon;
        for (var i = 0; i < icon.length; i++) {
            if(icon[i].disaster == places.disaster){
                console.log("They are equal");
                disaster_icon = icon[i].icon;
            }
        }
        var marker = new google.maps.Marker({
            position: places.latlon,
            map: map,
            title: places.county,
            icon: (disaster_icon)?disaster_icon:"http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = places;
            places.message.open(map, marker);
        });

    };

    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load',
        googleMapService.refresh(selectedLat, selectedLng));

    return googleMapService;
});

