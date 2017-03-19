/*
These icons are from the Material Design icon set. I have copied the SVG paths
here as there doesn't seem to be any better way to do everything needed:
 * Be able to use them as map marker icons
 * Be able to set their fill color
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
        text: 'Add points',
        icon: POINT_ICON
    }, {
        klass: 'add_suggestion',
        text: 'Add suggestions',
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

const MARKER_PATHS = {
    point: POINT_PATH,
    suggestion: SUGGESTION_PATH
}


class GeoodleControl {
    constructor(controlDiv, map, center) {
        this.center = center;
        this.map = map;
        this.participants = {};
        this.markers = [];

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
        this.markers.forEach(function(marker) {
            marker.setIcon({
                path: marker.icon.path,
                fillColor: color,
                fillOpacity: marker.icon.fillOpacity,
                anchor: marker.icon.anchor
            });
        });

        // Make sure the input is set correctly
        this.controls.choose_color.val(color);
    }

    add_point(latLng) {
        this._add_marker('point', 0, '', latLng);
    }

    add_suggestion(latLng) {
        this._add_marker('suggestion', 0, '', latLng);
    }

    _add_marker(type, owner, label, latLng) {
        let marker = new google.maps.Marker({
            icon: {
                path: MARKER_PATHS[type],
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
            // Not strictly necessary for suggestions...
            this.update_center_marker();
            this.emit('update');
        }.bind(this));
        // Not strictly necessary for suggestions...
        marker.addListener('drag', function() {
            this.update_center_marker();
        }.bind(this));
        marker.addListener('dragend', function() {
            this.emit('update');
        }.bind(this));

        this.markers.push({
            type: type,
            owner: owner,
            label: label,
            marker: marker
        });
    }

    remove_marker(marker) {
        marker.setMap(null);
        this.markers.splice(
            this.markers.indexOf(marker),
            1
        );
    }

    remove_all() {
        Object.keys(this.participants).forEach(function(participant_id) {
            this.remove_participant(participant_id);
        }.bind(this));

        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers.length = 0;
    }

    update_center_marker() {
        let lat = 0,
            lng = 0,
            point_count = 0;
        this.markers.forEach(function(marker_info) {
            if (marker_info.type == 'point') {
                let latLng = marker_info.marker.getPosition();
                lat += latLng.lat();
                lng += latLng.lng();
                point_count++;
            }
        });

        if (point_count <= 1) {
            this.center_marker.setPosition(this.center);
        } else {
            lat /= point_count;
            lng /= point_count;
            this.center_marker.setPosition({
                lat: lat,
                lng: lng
            });
        }
    }

    move_to_center() {
        this.map.panTo(this.center_marker.getPosition());
    }

    add_participant(id, name, color) {
        if (id === null) {
            // Find an id for this participant
            id = 0;
            while (this.participants[id] !== undefined) {
                id++;
            }
        }

        // Add them to the list of participants
        this.participants[id] = {
            id: id,
            name: name,
            color: color
        };

        // Let listeners know what's going on
        this.emit('add_participant', this.participants[id]);
        this.emit('update');
    }

    update_participant(id, attr, value) {
        // Update the participant
        this.participants[id][attr] = value;

        // TODO: Update marker color if necessary

        // Let listeners know what's going on
        this.emit('update_participant', this.participants[id]);
        this.emit('update');
    }

    remove_participant(id) {
        // Remove the participant
        delete this.participants[id];

        // TODO: Remove the participants markers

        // Let listeners know what's going on
        this.emit('remove_participant', id);
        this.emit('update');
    }

    set_selected_participant(id) {
        // TODO: Set selected participant

        // Let listeners know what's going on
        this.emit('set_selected_participant', id);
        this.emit('update');
    }

    serialise() {
        /*
        {
            participants: [
                {
                    id: 1,
                    name: 'Nick',
                    color: 'purple',
                },
                ...
            }],
            markers: [
                {
                    owner: <participant_id>,
                    type: <point or suggestion>,
                    lat: ...,
                    lng: ...,
                    label: ...
                },
                ...
            ]
        }
        */

        let markers = [];
        this.markers.forEach(function(marker_info) {
            let latLng = marker_info.marker.getPosition();
            markers.push({
                owner: marker_info.owner,
                type: marker_info.type,
                label: marker_info.label,
                lat: latLng.lat(),
                lng: latLng.lng()
            })
        });

        let output = {
            color: this.color,
            participants: Object.values(this.participants),
            markers: markers
        };
        console.log(output);
        return output;
    }

    deserialise(input) {
        this.remove_all();

        // Load participants
        input.participants.forEach(function(participant) {
            this.add_participant(
                participant.id,
                participant.name,
                participant.color
            );
        }.bind(this));

        // TODO: Remove
        this.set_color(input.color);

        // Load markers
        input.markers.forEach(function(marker_info) {
            this._add_marker(
                marker_info.type,
                marker_info.owner,
                marker_info.label,
                {
                    lat: marker_info.lat,
                    lng: marker_info.lng
                });
        }.bind(this));

        this.update_center_marker();
        this.emit('update');
    }
}

Emitter(GeoodleControl.prototype);
