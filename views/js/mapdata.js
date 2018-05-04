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

      $http.get('https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries').success(function(response){
        console.log("I am here somehow");
      }).error(function(){
        console.error("Error generated");
      });

      //perform an AJAX call to get all records
      $http.get('/history').success(function(response){
        var latest_query = response[response.length -1];
        locations = convertToMapPoints(latest_query);

        initialize(latitude, longitude);

      }).error(function(){});

    };

    var convertToMapPoints = function(response){
      var locations = [];
      console.log(response);
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


      $http.get('https://www.fema.gov/api/open/v1/DisasterDeclarationsSummaries?$filter='+query)
      .success(function(results){
        console.log(results);
        console.log("I am here somehow");
        for(var i= 0; i < results.length; i++) {
                var disasterreport = response[i];

                // Create popup windows for each record
                var  contentString =
                    '<p><b>State</b>: ' + user.state +
                    '<br><b>Disaster</b>: ' + user.disaster_type +
                    '<br><b>Date From</b>: ' + user.date_from +
                    '<br><b>Date To</b>: ' + user.date_to +
                    '</p>';

                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
                locations.push({
                    latlon: new google.maps.LatLng(user.location[1], user.location[0]),
                    message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                    }),
                    state: user.state,
                    disaster: user.disaster_type,
                    date_from: user.date_from,
                    date_to: user.date_to
            });
        }
      }).error(function(){
        console.error("Error generated");
      });
      
        // location is now an array populated with records in Google Maps format
        return locations;
    };

// Initializes the map
var initialize = function(latitude, longitude) {

    // Uses the selected lat, long as starting point
    var myLatLng = {lat: selectedLat, lng: selectedLng};

    // If map has not been created already...
    if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: myLatLng
        });
    }

    // Loop through each location in the array and place a marker
    locations.forEach(function(n, i){
        var marker = new google.maps.Marker({
            position: n.latlon,
            map: map,
            title: "Big Map",
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

            // When clicked, open the selected marker's message
            currentSelectedMarker = n;
            n.message.open(map, marker);
        });
    });

    // Set initial location as a bouncing red marker
    var initialLocation = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: initialLocation,
        animation: google.maps.Animation.BOUNCE,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    lastMarker = marker;

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