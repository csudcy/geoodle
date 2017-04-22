let LONDON = {lat: 51.51, lng: -0.17};

function initMap() {
    let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: LONDON,
        mapTypeControl: false
    });

    // Create the GeoodleControl
    let geoodleControlDiv = document.createElement('div');
    let geoodleControl = new GeoodleControl(geoodleControlDiv, map, LONDON);
    geoodleControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(geoodleControlDiv);

    // Display the title
    geoodleControl.on('update_title', function(title) {
        if (!title) {
            title = 'Welcome to Geoodle!';
        }
        $('#title').text(title);
    });

    // Whenever there is an update on the map, update the URL hash
    geoodleControl.on('update', function() {
        console.log('Update!');
        window.location.hash = btoa(
            JSON.stringify(
                geoodleControl.serialise()
            )
        );
    });

    // If there is a URL hash, use it!
    if (window.location.hash) {
        geoodleControl.deserialise(
            JSON.parse(
                atob(
                    window.location.hash.substr(1)
                )
            )
        );
    }

    // Create the LoginControl
    // let loginControlDiv = document.createElement('div');
    // let loginControl = new LoginControl(loginControlDiv);
    // loginControlDiv.index = 1;
    // map.controls[google.maps.ControlPosition.TOP_CENTER].push(loginControlDiv);
}
