/*
GeoodleControl

Requires: jQuery, noty
*/

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
const PARTICIPANT_ICON = '/static/icons/ic_person_black_24px.svg';

const BUTTONS = [
    {
        klass: 'toggle_participant',
        text: 'Manage participants',
        icon: PARTICIPANT_ICON
    }, {
        klass: 'toggle_add_mode',
        text: 'Toggle adding points/suggestions',
        icon: POINT_ICON
    }, {
        klass: 'remove_all_markers',
        text: 'Clear points & suggestions',
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

const MARKER_GRAPHICS = {
    point: {
        path: POINT_PATH,
        icon: POINT_ICON
    },
    suggestion: {
        path: SUGGESTION_PATH,
        icon: SUGGESTION_ICON
    }
}


class GeoodleControl {
    /**************************************\
    *            INITIALISATION            *
    \**************************************/
    constructor(controlDiv, map, center) {
        this.map = map;
        this.center = center;

        this.participants = {};
        this.markers = [];
        this.add_mode = 'point';
        this.selected_participant_id = null;

        this.init_controls(controlDiv);
        this.init_button_listeners();
        this.init_participant_button_listeners();
        this.init_center_marker();
        this.init_map_listeners();

        // Setup Noty defaults
        $.noty.defaults.layout = 'bottomCenter';
        $.noty.defaults.theme = 'relax';
        $.noty.defaults.type = 'information';
        $.noty.defaults.timeout = 5000;
        $.noty.defaults.progressBar = true;
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
                    cursor: pointer;
                ">
                    <div class="control_icon" title="${button['text']}" style="
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
                    text-align: center;
                ">
                <span
                    class="button_container"
                    style="
                        float: left;
                    ">
                    ${BUTTON_HTML}
                </span>
                <span
                    class="participant_container"
                    style="
                        float: left;
                        text-align: center;
                        display: none;
                    ">
                    Participants:
                    <div class="participant_list">
                    </div>
                    <button
                        class="add_participant">
                        Add Participant
                    </button>
                    <br/>
                    <button
                        class="remove_all_participants">
                        Clear Participants
                    </button>
                </span>
                <div
                    style="
                        clear: both;
                    ">
                </div>
            </div>`);

        this.controls = {
            // Main buttons
            toggle_participant: controlDiv.find('.toggle_participant'),
            toggle_add_mode: controlDiv.find('.toggle_add_mode'),
            remove_all_markers: controlDiv.find('.remove_all_markers'),
            move_to_center: controlDiv.find('.move_to_center'),
            show_hide_help: controlDiv.find('.show_hide_help'),

            // Participant buttons
            participant_list: controlDiv.find('.participant_list'),
            add_participant: controlDiv.find('.add_participant'),
            remove_all_participants: controlDiv.find('.remove_all_participants'),

            // Other
            toggle_add_mode_icon: controlDiv.find('.toggle_add_mode .control_icon'),
            participant_container: controlDiv.find('.participant_container'),
            control_labels: controlDiv.find('.control_label')
        }
    }

    init_button_listeners() {
        this.controls.toggle_participant.click(function() {
            this.controls.participant_container.toggle();
        }.bind(this));

        this.controls.toggle_add_mode.click(function() {
            this.toggle_add_mode();
        }.bind(this));

        this.controls.remove_all_markers.click(function() {
            this.remove_all_markers();
            this.update_center_marker();
            this.emit('update');
        }.bind(this));

        this.controls.move_to_center.click(function() {
            this.move_to_center();
        }.bind(this));

        this.controls.show_hide_help.click(function() {
            this.controls.control_labels.toggle();
        }.bind(this));
    }

    init_participant_button_listeners() {
        this.controls.add_participant.click(function() {
            this.add_participant(null, 'A participant', '#ff0000');
        }.bind(this));

        this.controls.participant_list.on('change', '[name="selected_participant"]', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.set_selected_participant(id);
        }.bind(this))

        this.controls.participant_list.on('change', '.participant_color', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.update_participant(id, 'color', target.val());
        }.bind(this))

        this.controls.participant_list.on('change', '.participant_name', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.update_participant(id, 'name', target.val());
        }.bind(this))

        this.controls.participant_list.on('click', '.remove_participant', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.remove_participant(id);
        }.bind(this))

        this.controls.remove_all_participants.click(function(e) {
            this.remove_all_participants();
        }.bind(this))
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
            if (this.add_mode == 'point') {
                this.add_marker('point', e.latLng);
                this.update_center_marker();
            } else {
                this.add_marker('suggestion', e.latLng);
            }
            this.emit('update');
        }.bind(this));
    }

    /**************************************\
    *           MARKER MANAGEMENT          *
    \**************************************/

    toggle_add_mode() {
        if (this.add_mode != 'point') {
            this.add_mode = 'point';
        } else {
            this.add_mode = 'suggestion';
        }

        let BUTTON_ICON = MARKER_GRAPHICS[this.add_mode].icon;
        this.controls.toggle_add_mode_icon.css('background-image', `url(${BUTTON_ICON})`);
    }

    add_marker(type, latLng) {
        let owner = this.get_selected_participant();
        this._add_marker(type, owner, '', latLng);
    }

    _add_marker(type, owner, label, latLng) {
        let marker = new google.maps.Marker({
            icon: {
                path: MARKER_GRAPHICS[type].path,
                fillColor: this.participants[owner].color,
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
        // Check this marker can be removed
        let owner = this.get_selected_participant();
        if (owner === undefined) return;

        let marker_info = this.markers.find(
            marker_info => marker_info.marker == marker
        );
        if (marker_info.owner !== owner) {
            noty({
                text: 'You cannot remove other participants markers!',
                type: 'error'
            });
            return;
        }

        this._remove_marker(marker);
    }

    _remove_marker(marker) {
        // Remove the given marker
        marker.setMap(null);

        this.markers = this.markers.filter(
            marker_info => marker_info.marker !== marker
        );
    }

    remove_all_markers() {
        let owner = this.get_selected_participant();
        if (owner === undefined) return;

        this.markers.filter(
            marker_info => marker_info.owner == owner
        ).forEach(
            marker_info => this.remove_marker(marker_info.marker)
        );
    }

    update_marker_colors() {
        // Update all the markers
        this.markers.forEach(function(marker_info) {
            let marker = marker_info.marker;
            marker.setIcon({
                path: marker.icon.path,
                fillColor: this.participants[marker_info.owner].color,
                fillOpacity: marker.icon.fillOpacity,
                anchor: marker.icon.anchor
            });
        }.bind(this));
    }

    /**************************************\
    *             CENTER MARKER            *
    \**************************************/

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

    /**************************************\
    *             PARTICIPANTS             *
    \**************************************/

    _get_participant_html(id, name, color) {
        return `
            <div
                participant_id="${id}">
                <input
                    type="radio"
                    name="selected_participant">
                <input
                    class="participant_color"
                    title="Set participant colour"
                    type="color"
                    value="${color}"
                    style="
                        border: none;
                        border-radius: 5px;
                        width: 20px;
                    "/>
                <input
                    class="participant_name"
                    title="Enter participants name"
                    type="text"
                    value="${name}"
                    style="
                        width: 65px;
                    "/>
                <button
                    class="remove_participant">
                    X
                </button>
            </div>`;
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

        // Update UI
        this.controls.participant_list.append(
            this._get_participant_html(
                id,
                name,
                color
            )
        );

        // Let listeners know what's going on
        this.emit('add_participant', this.participants[id]);
        this.emit('update');
    }

    update_participant(id, attr, value) {
        // Update the participant
        this.participants[id][attr] = value;

        // Update UI
        this.update_marker_colors();
        this.update_selected_participant_color();
        let participant_element = this.controls.participant_list.find(`[participant_id=${id}]`);
        participant_element.find('.participant_color').val(this.participants[id].color);
        participant_element.find('.participant_name').val(this.participants[id].name);

        // Let listeners know what's going on
        this.emit('update_participant', this.participants[id]);
        this.emit('update');
    }

    remove_participant(id) {
        // Remove the participant
        delete this.participants[id];

        // Remove the participants markers
        this.markers.filter(
            marker_info => marker_info.owner == id
        ).forEach(
            marker_info => this._remove_marker(marker_info.marker)
        );
        this.update_center_marker();

        // Unset selected participant if necessary
        if (this.selected_participant_id === id) {
            this.set_selected_participant(null);
        }

        // Update UI
        this.controls.participant_list.find(`[participant_id=${id}]`).remove();

        // Let listeners know what's going on
        this.emit('remove_participant', id);
        this.emit('update');
    }

    set_selected_participant(id) {
        // Set selected participant
        this.selected_participant_id = id;

        // Update UI
        let selected_participant_element = this.controls.participant_list.find(`[participant_id=${id}] input[type="radio"]`);
        selected_participant_element.prop('checked', true);
        this.update_selected_participant_color();

        // Let listeners know what's going on
        this.emit('set_selected_participant', id);
        this.emit('update');
    }

    update_selected_participant_color() {
        let color = 'lightgrey';
        if (this.selected_participant_id !== null) {
            color = this.participants[this.selected_participant_id].color;
        }
        this.controls.toggle_participant.css('background-color', color);
    }

    get_selected_participant() { 
        // If there are no participants, add one
        if (Object.keys(this.participants).length === 0) {
            this.add_participant(null, 'A participant', '#00ffff');
            noty({text: 'I added a default participant'});
        }

        // If there is no selected participant, select one
        if (this.selected_participant_id === null) {
            this.set_selected_participant(Object.keys(this.participants)[0]);
            noty({text: 'I selected a participant'});
        }

        return this.selected_participant_id;
    }

    remove_all_participants() {
        Object.keys(this.participants).forEach(
            participant_id => this.remove_participant(participant_id)
        );
        this.update_center_marker();
        this.emit('update');
    }

    /**************************************\
    *            SERIALISATION             *
    \**************************************/

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

        return {
            color: this.color,
            participants: Object.values(this.participants),
            markers: markers
        };
    }

    deserialise(input) {
        // Remove all participants & markers
        this.remove_all_participants();

        // Load participants
        input.participants.forEach(
            participant => this.add_participant(
                participant.id,
                participant.name,
                participant.color
            )
        );

        // Load markers
        input.markers.forEach(
            marker_info => this._add_marker(
                marker_info.type,
                marker_info.owner,
                marker_info.label,
                {
                    lat: marker_info.lat,
                    lng: marker_info.lng
                }
            )
        );

        this.update_center_marker();
        this.move_to_center();
        this.emit('update');
    }
}

Emitter(GeoodleControl.prototype);
