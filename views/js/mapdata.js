 exports.initMap = function(){
    //Map options added
    var options ={
      zoom:8,
      center:{lat:42.3601, lng:-71.0589}
    }
    //New map created
    var map = new google.maps.Map(document.getElementById('map'), options);
    //Markers added
    //function to add marker based on props
    function addMarker(props){
      var marker = new google.maps.Marker({
        position:props.coords,
        map:map
      });

      //check if props has icon
      if(props.icon){
        marker.setIcon(props.icon);
      }

      if(props.content){
        var infoWindow = new google.maps.InfoWindow({
          content: props.content
        });

        marker.addListener('click', function(){
          infoWindow.open(map, marker);
        });
      }

    }
  }