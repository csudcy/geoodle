/**
 * The GeoodleControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */

/*
These icons are from the Material Design icon set. I have copied the SVG paths
here as there doesn't seem to be any better way to do everything needed:
 * Be able to use them as map marker icons
 * Be able to set their fill colour
 * Be able to use them in the controls
*/
const POINT_PATH = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
const SUGGESTION_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const CLEAR_PATH = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';
const CENTER_PATH = 'M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z';


class GeoodleControl {
    // let _center = null;
    // let _map = null;
    // let _markers = null;

    constructor(controlDiv, map, center) {
        this.center = center;
        this.map = map;
        this.markers = [];

        this.init_controls(controlDiv);
        this.init_center_marker();
        this.init_listeners();
    }

    init_controls(controlDiv) {
        controlDiv.innerHTML = `
            <div
                class="container"
                style="
                    background-color: white;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 3px;
                    box-shadow: rgba(0, 0, 0, 0.298039) 0px 2px 6px;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                    line-height: 28px;
                ">
                <div
                    class="add_point"
                    title="Add/remove points"
                    style="
                        background: lightgrey;
                        border: 2px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 5px;
                    ">
                    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                        <path d="${POINT_PATH}"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </div>
                <div
                    class="add_suggestion"
                    title=""
                    style="
                        background: lightgrey;
                        border: 2px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 5px;
                    ">
                    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                        <path d="${SUGGESTION_PATH}"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </div>
                <div
                    class="remove_all"
                    title="Remove all points & suggestions"
                    style="
                        background: lightgrey;
                        border: 2px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 5px;
                    ">
                    <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                        <path d="${CLEAR_PATH}"/>
                        <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                </div>
            </div>`;

        // controlDiv.getElementsByClassName('recenter')[0].addEventListener('click', function() {
        //     map.setCenter(center);
        // });
    }

    init_center_marker() {
        // Setup the center marker
        this.center_marker = new google.maps.Marker({
            icon: {
                path: CENTER_PATH,
                fillColor: 'purple',
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: this.center,
            map: this.map
        });
    }

    init_listeners() {
        map.addListener('click', function(e) {
            this.add_marker(e.latLng);
        }.bind(this));
    }

    add_marker(latLng) {
        var marker = new google.maps.Marker({
            icon: {
                path: POINT_PATH,
                fillColor: 'red',
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: latLng,
            map: this.map,
            draggable: true
        });
        marker.addListener('click', function() {
            this.remove_marker(marker);
        }.bind(this));
        marker.addListener('drag', function() {
            this.update_center_marker();
        }.bind(this));
        this.markers.push(marker);
        this.update_center_marker();
    }

    remove_marker(marker) {
        marker.setMap(null);
        this.markers.splice(
            this.markers.indexOf(marker),
            1
        );
        this.update_center_marker();
    }

    update_center_marker() {
        if (this.markers.length <= 1) {
            this.center_marker.setPosition(this.center);
        } else {
            var lat = 0,
                lng = 0;
            this.markers.forEach(function(marker) {
                var latLng = marker.getPosition();
                lat += latLng.lat();
                lng += latLng.lng();
            });
            lat /= this.markers.length;
            lng /= this.markers.length;
            this.center_marker.setPosition({
                lat: lat,
                lng: lng
            });
        }
    }
}


// GeoodleControl.prototype.serialise = function() {
// }

// GeoodleControl.prototype.deserialise = function() {
// }
