let map;

let LONDON = {lat: 51.51, lng: -0.17};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: LONDON
    });

    // Create the GeoodleControl
    let controlDiv = document.createElement('div');
    let control = new GeoodleControl(controlDiv, map, LONDON);
    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(controlDiv);

    // Whenever there is an update on the map, update the URL hash
    control.on('update', function() {
        window.location.hash = JSON.stringify(control.serialise());
    });

    // If there is a URL hash, use it!
    if (window.location.hash) {
        control.deserialise(JSON.parse(window.location.hash.substr(1)));
    }
}
