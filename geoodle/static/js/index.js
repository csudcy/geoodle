var map,
    markers = [],
    centre_marker;

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

    // Setup the centre marker
    centre_marker = new google.maps.Marker({
        position: LONDON,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    map.addListener('click', function(e) {
        add_marker(e.latLng);
    });
}

function add_marker(latLng) {
    var marker = new google.maps.Marker({
        icon: {
            path: POINT_PATH,
            fillColor: 'red',
            fillOpacity: 1,
            anchor: {x: 12, y: 28}
        },
        position: latLng,
        map: map,
        draggable: true
    });
    marker.addListener('click', function() {
        remove_marker(marker);
    });
    marker.addListener('drag', function() {
        update_centre_marker();
    });
    markers.push(marker);
    update_centre_marker();
}

function remove_marker(marker) {
    marker.setMap(null);
    markers.splice(markers.indexOf(marker), 1);
    update_centre_marker();
}

function update_centre_marker() {
    if (markers.length <= 1) {
        centre_marker.setPosition(LONDON);
    } else {
        var lat = 0,
            lng = 0;
        markers.forEach(function(marker) {
            var latLng = marker.getPosition();
            lat += latLng.lat();
            lng += latLng.lng();
        });
        lat /= markers.length;
        lng /= markers.length;
        centre_marker.setPosition({
            lat: lat,
            lng: lng
        });
    }
}
