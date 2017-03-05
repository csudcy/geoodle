var map;

var LONDON = {lat: 51.51, lng: -0.17};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: LONDON
    });

    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new GeoodleControl(centerControlDiv, map, LONDON);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);

}
