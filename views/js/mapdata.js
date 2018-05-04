angular.module('mapdata', []).factory('mapdata', function($http){

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
            console.log("Step 2");
            var disasterSummary = results.DisasterDeclarationsSummaries;

            //Loop over each of the disasters to pinpoint on map
            for (var i = 0; i < disasterSummary.length; i++) {
                var county;
                if(disasterSummary[i].declaredCountyArea){
                    county = disasterSummary[i].declaredCountyArea.split(' (County)');
                }
                if(county)
                    address = county[0];
                else
                    address = disasterSummary[i].state;
                //Calling function to get coordinates
                var lat, lng;
                getCoords(disasterSummary[i], address, function(report, eachloc){
                    console.log(eachloc[0]+" "+eachloc[1]);
                    console.log(report);
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
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+address+'&key=AIzaSyCVonx72WOIIz2UW_L8Unp4P7E5Ob2bryk')
        .success(function(latlng){
            console.log("Step 3");
            // googleLatlang = new google.maps.LatLng(latlng.results[0].geometry.location.lat, latlng.results[0].geometry.location.lng)
            var LatLng = [];
            LatLng[0] = latlng.results[0].geometry.location.lat;
            LatLng[1] = latlng.results[0].geometry.location.lng;
            coordcallback(report, LatLng);
        })
        .error(function(){
            console.log("Step 5");
            console.error("API couldn't work well");
        });  
    }

    // Initializes the map
    var initialize = function(latitude, longitude, places, map) {

        // Uses the selected lat, long as starting point
        var myLatLng = {lat: selectedLat, lng: selectedLng};

        console.log(places);
        // If map has not been created already...
        // if (!map){
        //     // Create a new map and place in the index.html page
        //     var map = new google.maps.Map(document.getElementById('map'), {
        //         zoom: 4,
        //         center: myLatLng
        //     });
        // }

        // Loop through each location in the array and place a marker
        console.log("I am in initialize");
        console.log(places.latlon);
        var marker = new google.maps.Marker({
            position: places.latlon,
            map: map,
            title: "Big Map",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = places;
            places.message.open(map, marker);
        });

        // locations.forEach(function(n, i){
        //     console.log("I am here");
        //     console.log(n.latlon);
        //     var marker = new google.maps.Marker({
        //         position: n.latlon,
        //         map: map,
        //         title: "Big Map",
        //         icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        //     });

        //     // For each marker created, add a listener that checks for clicks
        //     google.maps.event.addListener(marker, 'click', function(e){

        //         // When clicked, open the selected marker's message
        //         currentSelectedMarker = n;
        //         n.message.open(map, marker);
        //     });
        // });

        // Set initial location as a bouncing red marker
        // var initialLocation = new google.maps.LatLng(latitude, longitude);
        // var marker = new google.maps.Marker({
        //     position: initialLocation,
        //     animation: google.maps.Animation.BOUNCE,
        //     map: map,
        //     icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        // });
        // lastMarker = marker;

    };

    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load',
        googleMapService.refresh(selectedLat, selectedLng));

    return googleMapService;
});

 // exports.initMap = function(){
 //    //Map options added
 //    var options ={
 //      zoom:8,
 //      center:{lat:42.3601, lng:-71.0589}
 //    }
 //    //New map created
 //    var map = new google.maps.Map(document.getElementById('map'), options);
 //    //Markers added
 //    //function to add marker based on props
 //    function addMarker(props){
 //      var marker = new google.maps.Marker({
 //        position:props.coords,
 //        map:map
 //      });

 //      //check if props has icon
 //      if(props.icon){
 //        marker.setIcon(props.icon);
 //      }

 //      if(props.content){
 //        var infoWindow = new google.maps.InfoWindow({
 //          content: props.content
 //        });

 //        marker.addListener('click', function(){
 //          infoWindow.open(map, marker);
 //        });
 //      }

 //    }
 //  }