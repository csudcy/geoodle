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

        this.color = '#ff0000';

        this.init_controls(controlDiv);
        this.init_control_listeners();
        this.init_center_marker();
        this.init_map_listeners();
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
                <input
                    class="choose_color"
                    title="Set your colour"
                    type="color"
                    value="${this.color}"
                    style="
                        border: 2px solid rgb(255, 255, 255);
                        border-radius: 10px;
                        padding: 5px;
                        width: 24px;
                    ">
                </input>
            </div>`;

        this.controls = {
            add_point: controlDiv.getElementsByClassName('add_point')[0],
            add_suggestion: controlDiv.getElementsByClassName('add_suggestion')[0],
            remove_all: controlDiv.getElementsByClassName('remove_all')[0],
            choose_color: controlDiv.getElementsByClassName('choose_color')[0]
        }
    }

    init_control_listeners() {
        this.controls.add_point.addEventListener('click', function() {
            console.log('TODO: add_point');
        }.bind(this));

        this.controls.add_suggestion.addEventListener('click', function() {
            console.log('TODO: add_suggestion');
        }.bind(this));

        this.controls.remove_all.addEventListener('click', function() {
            this.remove_all();
            this.update_center_marker();
            this.emit('update');
        }.bind(this));

        this.controls.choose_color.addEventListener('change', function(e) {
            this.set_color(e.target.value);
            this.emit('update');
        }.bind(this));
    }

    init_center_marker() {
        // Setup the center marker
        this.center_marker = new google.maps.Marker({
            icon: {
                path: CENTER_PATH,
                fillColor: 'white',
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: this.center,
            map: this.map
        });
    }

    init_map_listeners() {
        map.addListener('click', function(e) {
            this.add_marker(e.latLng);
            this.update_center_marker();
            this.emit('update');
        }.bind(this));
    }

    set_color(color) {
        this.color = color;

        // Update all the markers
        this.markers.forEach(function(marker) {
            marker.setIcon({
                path: POINT_PATH,
                fillColor: color,
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            });
        });

        // Make sure the input is set correctly
        this.controls.choose_color.value = color;
    }

    add_marker(latLng) {
        let marker = new google.maps.Marker({
            icon: {
                path: POINT_PATH,
                fillColor: this.color,
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: latLng,
            map: this.map,
            draggable: true
        });
        marker.addListener('click', function() {
            this.remove_marker(marker);
            this.update_center_marker();
            this.emit('update');
        }.bind(this));
        marker.addListener('drag', function() {
            this.update_center_marker();
        }.bind(this));
        marker.addListener('dragend', function() {
            this.emit('update');
        }.bind(this));
        this.markers.push(marker);
    }

    remove_marker(marker) {
        marker.setMap(null);
        this.markers.splice(
            this.markers.indexOf(marker),
            1
        );
    }

    remove_all() {
        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers.length = 0;
    }

    update_center_marker() {
        if (this.markers.length <= 1) {
            this.center_marker.setPosition(this.center);
        } else {
            let lat = 0,
                lng = 0;
            this.markers.forEach(function(marker) {
                let latLng = marker.getPosition();
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

    serialise() {
        /*
        {
            'v': 1,
            'people': [
                {
                    'name': 'Nick',
                    'color': 'purple',
                    'points': [
                        {
                            lat: ...,
                            lng: ...,
                            label: ...
                        },
                        ...
                    ],
                    'suggestions': [
                        {
                            lat: ...,
                            lng: ...,
                            label: ...,
                            votes: ???
                        },
                        ...
                    ],
                },
                ...
            ]
        }
        */
        let points = [];
        this.markers.forEach(function(marker) {
            let latLng = marker.getPosition();
            points.push({
                lat: latLng.lat(),
                lng: latLng.lng()
            })
        });
        // window.location.hash
        return {
            color: this.color,
            points: points
        };
    }

    deserialise(input) {
        this.remove_all();
        this.set_color(input.color);
        input.points.forEach(this.add_marker.bind(this));
        this.update_center_marker();
        this.emit('update');
    }
}

Emitter(GeoodleControl.prototype);
