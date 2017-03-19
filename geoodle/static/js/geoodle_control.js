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

const POINT_ICON = '/static/icons/ic_home_black_24px.svg';
const SUGGESTION_ICON = '/static/icons/ic_star_black_24px.svg';
const CLEAR_ICON = '/static/icons/ic_clear_black_24px.svg';
const CENTER_ICON = '/static/icons/ic_location_searching_black_24px.svg';
const HELP_ICON = '/static/icons/ic_help_outline_black_24px.svg';

const BUTTONS = [
    {
        klass: 'add_point',
        text: 'Add/remove points',
        icon: POINT_ICON
    }, {
        klass: 'add_suggestion',
        text: 'Add/remove suggestions',
        icon: SUGGESTION_ICON
    }, {
        klass: 'remove_all',
        text: 'Remove all points & suggestions',
        icon: CLEAR_ICON
    }, {
        klass: 'move_to_center',
        text: 'Move to current center',
        icon: CENTER_ICON
    }, {
        klass: 'show_hide_help',
        text: 'Show/hide help',
        icon: HELP_ICON
    }
];


class GeoodleControl {
    constructor(controlDiv, map, center) {
        this.center = center;
        this.map = map;
        this.markers = {
            points: [],
            suggestions: []
        };

        this.color = '#ff0000';
        this.current_mode = undefined;

        this.init_controls(controlDiv);
        this.init_control_listeners();
        this.init_center_marker();
        this.init_map_listeners();

        this.set_current_mode('points');
    }

    init_controls(controlDivElement) {
        let controlDiv = $(controlDivElement);

        let BUTTON_HTML = '';
        BUTTONS.forEach(function(button) {
            BUTTON_HTML += `
                <div class="${button['klass']}" title="${button['text']}" style="
                    background: lightgrey;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 10px;
                    padding: 5px;
                ">
                    <div title="${button['text']}" style="
                            background: url(${button['icon']})
                                no-repeat
                                center;
                            min-width: 24px;
                            height: 24px;
                        ">
                    </div>
                    <div class="control_label" style="display: none;">
                        ${button['text']}
                    </div>
                </div>
                `;
        });
        controlDiv.html(`
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
                ${BUTTON_HTML}
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
            </div>`);

        this.controls = {
            add_point: controlDiv.find('.add_point'),
            add_suggestion: controlDiv.find('.add_suggestion'),
            remove_all: controlDiv.find('.remove_all'),
            move_to_center: controlDiv.find('.move_to_center'),
            show_hide_help: controlDiv.find('.show_hide_help'),
            choose_color: controlDiv.find('.choose_color')
        }

        this.control_labels = controlDiv.find('.control_label');
    }

    init_control_listeners() {
        this.controls.add_point.click(function() {
            this.set_current_mode('points');
        }.bind(this));

        this.controls.add_suggestion.click(function() {
            this.set_current_mode('suggestions');
        }.bind(this));

        this.controls.remove_all.click(function() {
            this.remove_all();
            this.update_center_marker();
            this.emit('update');
        }.bind(this));

        this.controls.move_to_center.click(function() {
            this.move_to_center();
        }.bind(this));

        this.controls.show_hide_help.click(function() {
            // this.show_hide_help();
            this.control_labels.toggle();
        }.bind(this));

        this.controls.choose_color.change(function(e) {
            this.set_color(e.target.value);
            this.emit('update');
        }.bind(this));
    }

    set_current_mode(current_mode) {
        this.current_mode = current_mode;
        this.controls.add_point.css('background-color', current_mode == 'points' ? 'darkgrey' : 'lightgrey');
        this.controls.add_suggestion.css('background-color', current_mode == 'suggestions' ? 'darkgrey' : 'lightgrey');
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
            if (this.current_mode == 'points') {
                this.add_point(e.latLng);
                this.update_center_marker();
            } else {
                this.add_suggestion(e.latLng);
            }
            this.emit('update');
        }.bind(this));
    }

    set_color(color) {
        this.color = color;

        // Update all the markers
        Object.keys(this.markers).forEach(function(type) {
            this.markers[type].forEach(function(marker) {
                marker.setIcon({
                    path: marker.icon.path,
                    fillColor: color,
                    fillOpacity: marker.icon.fillOpacity,
                    anchor: marker.icon.anchor
                });
            });
        }.bind(this));

        // Make sure the input is set correctly
        this.controls.choose_color.val(color);
    }

    add_point(latLng) {
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
            this.remove_marker('points', marker);
            this.update_center_marker();
            this.emit('update');
        }.bind(this));
        marker.addListener('drag', function() {
            this.update_center_marker();
        }.bind(this));
        marker.addListener('dragend', function() {
            this.emit('update');
        }.bind(this));
        this.markers.points.push(marker);
    }

    add_suggestion(latLng) {
        let marker = new google.maps.Marker({
            icon: {
                path: SUGGESTION_PATH,
                fillColor: this.color,
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: latLng,
            map: this.map,
            draggable: true
        });
        marker.addListener('click', function() {
            this.remove_marker('suggestions', marker);
            this.emit('update');
        }.bind(this));
        marker.addListener('dragend', function() {
            this.emit('update');
        }.bind(this));
        this.markers.suggestions.push(marker);
    }

    remove_marker(type, marker) {
        marker.setMap(null);
        this.markers[type].splice(
            this.markers[type].indexOf(marker),
            1
        );
    }

    remove_all() {
        this.markers.points.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers.points.length = 0;

        this.markers.suggestions.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers.suggestions.length = 0;
    }

    update_center_marker() {
        if (this.markers.points.length <= 1) {
            this.center_marker.setPosition(this.center);
        } else {
            let lat = 0,
                lng = 0;
            this.markers.points.forEach(function(marker) {
                let latLng = marker.getPosition();
                lat += latLng.lat();
                lng += latLng.lng();
            });
            lat /= this.markers.points.length;
            lng /= this.markers.points.length;
            this.center_marker.setPosition({
                lat: lat,
                lng: lng
            });
        }
    }

    move_to_center() {
        this.map.panTo(this.center_marker.getPosition());
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
        let output = {
            color: this.color
        };

        Object.keys(this.markers).forEach(function(type) {
            let markers = [];
            this.markers[type].forEach(function(marker) {
                let latLng = marker.getPosition();
                markers.push({
                    lat: latLng.lat(),
                    lng: latLng.lng()
                })
            });
            output[type] = markers;
        }.bind(this));

        return output;
    }

    deserialise(input) {
        this.remove_all();
        this.set_color(input.color);
        input.points.forEach(this.add_point.bind(this));
        if (input.suggestions) {
            input.suggestions.forEach(this.add_suggestion.bind(this));
        }
        this.update_center_marker();
        this.emit('update');
    }
}

Emitter(GeoodleControl.prototype);
