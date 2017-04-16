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
// Map Markers have to use SVGs paths
const SVG_PATHS = {
    center: 'M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z',
    point: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    suggestion: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
}

// Everything else uses icons
const ICON_URLS = {
    center: '/static/icons/ic_location_searching_black_24px.svg',
    clear: '/static/icons/ic_clear_black_24px.svg',
    delete: '/static/icons/ic_delete_black_24px.svg',
    directions: '/static/icons/ic_directions_black_24px.svg',
    directions_bike: '/static/icons/ic_directions_bike_black_24px.svg',
    directions_car: '/static/icons/ic_directions_car_black_24px.svg',
    directions_transit: '/static/icons/ic_directions_transit_black_24px.svg',
    directions_walk: '/static/icons/ic_directions_walk_black_24px.svg',
    folder: '/static/icons/ic_folder_black_24px.svg',
    help: '/static/icons/ic_help_outline_black_24px.svg',
    participant: '/static/icons/ic_person_black_24px.svg',
    point: '/static/icons/ic_home_black_24px.svg',
    suggestion: '/static/icons/ic_star_black_24px.svg'
}

const BUTTONS = [
    {
        klass: 'toggle_geoodle',
        text: 'Manage Geoodle\'s',
        icon: ICON_URLS.folder,
    }, {
        klass: 'toggle_participant',
        text: 'Manage participants',
        icon: ICON_URLS.participant,
    }, {
        klass: 'toggle_add_mode',
        text: 'Toggle adding points/suggestions',
        icon: ICON_URLS.point,
    }, {
        klass: 'show_transport_times',
        text: 'Show transport times',
        icon: ICON_URLS.directions,
    }, {
        klass: 'remove_all_markers',
        text: 'Clear points & suggestions',
        icon: ICON_URLS.delete,
    }, {
        klass: 'move_to_center',
        text: 'Move to current center',
        icon: ICON_URLS.center,
    }, {
        klass: 'show_hide_help',
        text: 'Show/hide help',
        icon: ICON_URLS.help,
    }
];

const TRANSPORT_MODES = [
    'walk',
    'transit',
    'car',
    'bike'
];

const TRANSPORT_MODE_MAP = {
    'walk': 'WALKING',
    'transit': 'TRANSIT',
    'car': 'DRIVING',
    'bike': 'BICYCLING'
};


class GeoodleControl {
    /**************************************\
    *            INITIALISATION            *
    \**************************************/
    constructor(controlDiv, map, center) {
        this.map = map;
        this.center = center;

        this.geoodles = {};

        this.add_mode = 'point';
        this.selected_geoodle_id = null;
        this.selected_participant_id = null;
        this.infowindow_marker_info = null;

        this.init_controls(controlDiv);
        this.init_control_listeners();
        this.init_participant_button_listeners();
        this.init_center_marker();
        this.init_map_listeners(map);
        this.init_noty();
        this.init_infowindow();
        this.init_infowindow_listeners();
        this.init_hoverwindow();
    }

    _get_button_html(klass, text, icon) {
        let ICON_WH = 24,
            ICON_PADDING = 5;
        return `
            <button title="${text}" style="
                    background: url(${icon})
                        no-repeat;
                    background-position-y: center;
                    background-position-x: 5px;
                    background-color: lightgrey;
                    background-size: ${ICON_WH}px;
                    padding-left: ${ICON_WH + ICON_PADDING}px;
                    min-width: ${ICON_WH + 2 * ICON_PADDING}px;
                    width: 100%;
                    height: ${ICON_WH + 2 * ICON_PADDING}px;
                    border: none;
                    border-radius: ${ICON_PADDING}px;
                    margin-bottom: 5px;
                    display: block;
                 "
                class="${klass}">
                <span class="control_label" style="display: none;">
                    ${text}
                </span>
            </button>
        `;
    }

    init_controls(controlDivElement) {
        let controlDiv = $(controlDivElement);

        let BUTTON_HTML = '';
        BUTTONS.forEach(function(button) {
            BUTTON_HTML += this._get_button_html(
                button.klass,
                button.text,
                button.icon
            );
        }.bind(this));
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
                        margin-bottom: -5px;
                    ">
                    ${BUTTON_HTML}
                </span>

                <span
                    class="participant_container"
                    style="
                        float: left;
                        text-align: center;
                        display: none;
                        border: 1px solid black;
                        border-radius: 5px;
                        padding: 2px;
                        margin-left: 3px;
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

                <span
                    class="geoodle_container"
                    style="
                        float: left;
                        text-align: center;
                        display: none;
                        border: 1px solid black;
                        border-radius: 5px;
                        padding: 2px;
                        margin-left: 3px;
                    ">
                    Geoodles:
                    <div class="geoodle_list">
                    </div>
                    <button
                        class="add_geoodle">
                        Add Geoodle
                    </button>
                </span>

                <div
                    style="
                        clear: both;
                    ">
                </div>
            </div>`);

        this.controlDiv = controlDiv;
        this.controls = {
            // Main buttons
            toggle_geoodle: controlDiv.find('.toggle_geoodle'),
            toggle_participant: controlDiv.find('.toggle_participant'),
            toggle_add_mode: controlDiv.find('.toggle_add_mode'),
            show_transport_times: controlDiv.find('.show_transport_times'),
            remove_all_markers: controlDiv.find('.remove_all_markers'),
            move_to_center: controlDiv.find('.move_to_center'),
            show_hide_help: controlDiv.find('.show_hide_help'),

            // Participant buttons
            participant_list: controlDiv.find('.participant_list'),
            add_participant: controlDiv.find('.add_participant'),
            remove_all_participants: controlDiv.find('.remove_all_participants'),

            // Geoodle buttons
            geoodle_list: controlDiv.find('.geoodle_list'),
            add_geoodle: controlDiv.find('.add_geoodle'),

            // Containers
            participant_container: controlDiv.find('.participant_container'),
            geoodle_container: controlDiv.find('.geoodle_container')
        };
    }

    init_control_listeners() {
        this.controls.toggle_geoodle.click(function() {
            this.controls.geoodle_container.toggle();
        }.bind(this));

        this.controls.toggle_participant.click(function() {
            this.controls.participant_container.toggle();
        }.bind(this));

        this.controls.toggle_add_mode.click(function() {
            this.toggle_add_mode();
        }.bind(this));

        this.controls.show_transport_times.click(function() {
            this.show_transport_times();
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
            // Have to do this live as participant help need toggling too
            this.controlDiv.find('.control_label').toggle();
        }.bind(this));
    }

    init_participant_button_listeners() {
        this.controls.add_participant.click(function() {
            this.add_participant(null, null, null);
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

        this.controls.participant_list.on('click', '.participant_transport', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.toggle_participant_transport(id);
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
                path: SVG_PATHS.center,
                fillColor: 'white',
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: this.center,
            map: this.map
        });
    }

    init_map_listeners(map) {
        map.addListener('click', function(e) {
            if (this.infowindow_marker_info !== null) {
                return this.hide_infowindow();
            }
            if (this.add_mode == 'point') {
                this.add_marker('point', e.latLng, this.update_center_marker.bind(this));
            } else {
                this.add_marker('suggestion', e.latLng);
            }
            this.emit('update');
        }.bind(this));
    }

    init_noty() {
        // Setup Noty defaults
        $.noty.defaults.layout = 'bottomCenter';
        $.noty.defaults.theme = 'relax';
        $.noty.defaults.type = 'information';
        $.noty.defaults.timeout = 5000;
        $.noty.defaults.progressBar = true;
    }

    init_infowindow() {
        let html = `
            <div class="info_popup">
                <div class="top_row">
                    <span class="owner_container">
                        <span
                            class="icon"
                            style="
                                display: inline-block;
                                // background: SET LATER;
                                // background-color: SET LATER;
                                width: 24px;
                                height: 24px;
                                border-radius: 5px;
                                cursor: pointer;
                            ">
                        </span>
                        <span
                            class="name"
                            style="
                                font-weight: bold;
                                padding: 5px;
                                vertical-align: super;
                            ">
                            SET LATER
                        </span>
                    </span>
                    <span
                        class="delete_marker"
                        style="
                            display: inline-block;
                            background:
                                url(${ICON_URLS.delete})
                                no-repeat
                                center;
                            background-color: lightgrey;
                            width: 24px;
                            height: 24px;
                            border-radius: 5px;
                            cursor: pointer;
                            float: right;
                        ">
                    </span>
                </div>
                <span class="description_container">
                    <input
                        type="textbox"
                        class="description"
                        placeholder="Description"
                        value="SET LATER"
                        style="
                            width: 175px;
                        "/>
                </span>
            </div>
        `;

        let infowindow_div = $(document.createElement('div'));
        infowindow_div.html(html);

        // Create an infoWindow
        this.infowindow = new google.maps.InfoWindow({
            content: infowindow_div[0]
        });
        google.maps.event.addListener(this.infowindow, 'closeclick', function() {
            this.hide_infowindow();
        }.bind(this));

        // Find the controls
        this.infowindow_controls = {
            icon: infowindow_div.find('.owner_container .icon'),
            name: infowindow_div.find('.owner_container .name'),
            description_input: infowindow_div.find('.description_container .description'),
            delete_marker: infowindow_div.find('.delete_marker'),
        };
    }

    init_infowindow_listeners() {
        this.infowindow_controls.delete_marker.click(function() {
            // Remove the marker
            this.remove_marker(this.infowindow_marker_info);

            // Update everything else
            this.update_center_marker();
            this.emit('update');
        }.bind(this));

        this.infowindow_controls.icon.click(function() {
            // Flip the marker type
            if (this.infowindow_marker_info.type != 'point') {
                this.infowindow_marker_info.type = 'point';
            } else {
                this.infowindow_marker_info.type = 'suggestion';
            }

            // Update everything else
            this.update_markers();
            this.update_infowindow();
            this.update_center_marker();
            this.emit('update');
        }.bind(this));

        this.infowindow_controls.description_input.on('change', function() {
            // Save the new description
            this.infowindow_marker_info.label = this.infowindow_controls.description_input.val();

            // Update everything else
            this.emit('update');
        }.bind(this));
    }

    init_hoverwindow() {
        let html = `
            <div class="info_popup">
                <div class="top_row">
                    <span class="owner_container">
                        <span
                            class="icon"
                            style="
                                display: inline-block;
                                // background: SET LATER;
                                // background-color: SET LATER;
                                width: 24px;
                                height: 24px;
                                border-radius: 5px;
                                cursor: pointer;
                            ">
                        </span>
                        <span
                            class="name"
                            style="
                                font-weight: bold;
                                padding: 5px;
                                vertical-align: super;
                            ">
                            SET LATER
                        </span>
                    </span>
                </div>
                <span class="description">
                </span>
            </div>
        `;

        let hoverwindow_div = $(document.createElement('div'));
        hoverwindow_div.html(html);

        // Create an hoverwindow
        this.hoverwindow = new google.maps.InfoWindow({
            content: hoverwindow_div[0]
        });

        // Find the controls
        this.hoverwindow_controls = {
            icon: hoverwindow_div.find('.owner_container .icon'),
            name: hoverwindow_div.find('.owner_container .name'),
            description: hoverwindow_div.find('.description'),
        };
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

        this.controls.toggle_add_mode.css(
            'background-image',
            `url(${ICON_URLS[this.add_mode]})`
        );
    }

    add_marker(type, latLng, callback) {
        let geocoder = new google.maps.Geocoder;
        geocoder.geocode(
            {'location': latLng},
            function(results, status) {
                let label;

                if (status === 'OK') {
                    if (results) {
                        label = results[0].formatted_address.split(',')[0];
                    } else {
                        label = 'No results found';
                    }
                } else {
                    label = 'Geocoder failed: ' + status;
                }

                let owner = this.get_selected_participant();
                this._add_marker(type, owner, label, latLng);

                if (callback) {
                    callback();
                }
            }.bind(this)
        );
    }

    _add_marker(type, owner, label, latLng) {
        let geoodle = this.get_selected_geoodle();

        let marker = new google.maps.Marker({
            icon: {
                path: SVG_PATHS[type],
                fillColor: geoodle.participants[owner].color,
                fillOpacity: 1,
                anchor: {x: 12, y: 12}
            },
            position: latLng,
            map: this.map,
            draggable: true
        });

        let marker_info = {
            type: type,
            owner: owner,
            label: label,
            marker: marker
        };
        geoodle.markers.push(marker_info);

        marker.addListener('click', function() {
            this.show_infowindow(marker_info);
        }.bind(this));
        // Not strictly necessary for suggestions...
        marker.addListener('drag', function() {
            this.update_center_marker();
        }.bind(this));
        marker.addListener('dragend', function() {
            this.emit('update');
        }.bind(this));

        marker.addListener('mouseover', function() {
            this.show_hoverwindow(marker_info);
        }.bind(this));
        marker.addListener('mouseout', function() {
            this.hide_hoverwindow();
        }.bind(this));
    }

    remove_marker(marker_info) {
        // // Check this marker can be removed
        // let owner = this.get_selected_participant();
        // if (owner === undefined) return;

        // if (marker_info.owner !== owner) {
        //     noty({
        //         text: 'You cannot remove other participants markers!',
        //         type: 'error'
        //     });
        //     return;
        // }

        this._remove_marker(marker_info);
    }

    _remove_marker(marker_info) {
        let geoodle = this.get_selected_geoodle();

        // If the info window belongs to this marker, close it
        if (marker_info == this.infowindow_marker_info) {
            this.hide_infowindow();
        }

        // Remove the given marker
        marker_info.marker.setMap(null);

        geoodle.markers = geoodle.markers.filter(
            check_marker_info => check_marker_info !== marker_info
        );
    }

    remove_all_markers() {
        let geoodle = this.get_selected_geoodle();

        let owner = this.get_selected_participant();
        if (owner === undefined) return;

        geoodle.markers.filter(
            marker_info => marker_info.owner == owner
        ).forEach(
            marker_info => this._remove_marker(marker_info)
        );
    }

    update_markers() {
        let geoodle = this.get_selected_geoodle();

        // Update all the markers
        geoodle.markers.forEach(function(marker_info) {
            let marker = marker_info.marker;
            marker.setIcon({
                path: SVG_PATHS[marker_info.type],
                fillColor: geoodle.participants[marker_info.owner].color,
                fillOpacity: marker.icon.fillOpacity,
                anchor: marker.icon.anchor
            });
        }.bind(this));
    }

    /**************************************\
    *              INFO WINDOW             *
    \**************************************/

    show_infowindow(marker_info) {
        if (this.infowindow_marker_info == marker_info) {
            // This is already the open window; close it
            this.hide_infowindow();
            return;
        }

        this.infowindow_marker_info = marker_info;

        this.hide_hoverwindow();
        this.update_infowindow();
        this.infowindow.open(this.map, marker_info.marker);

        this.infowindow_controls.description_input.focus();
        this.infowindow_controls.description_input.select();
    }

    update_infowindow(updated_participant_id) {
        // updated_participant_id (optional): The participant that is being updated
        if (!this.infowindow_marker_info) {
            // There is no info_window open
            return;
        }
        if (updated_participant_id && updated_participant_id !== this.infowindow_marker_info.owner) {
            // There is a specific participant being udpate and it is not the
            // one the info window is for
            return;
        }

        this._update_window_info(this.infowindow_marker_info, this.infowindow_controls);
    }

    hide_infowindow() {
        this.infowindow_marker_info = null;
        this.infowindow.close();
    }

    _update_window_info(marker_info, controls) {
        let geoodle = this.get_selected_geoodle();

        controls.icon.css(
            'background',
            `url(${ICON_URLS[marker_info.type]}) no-repeat center`
        );
        controls.icon.css(
            'background-color',
            geoodle.participants[marker_info.owner].color
        );
        controls.name.text(
            geoodle.participants[marker_info.owner].name
        );
        if (controls.description_input) {
            controls.description_input.val(
                marker_info.label
            );
        } else {
            controls.description.text(
                marker_info.label
            );
        }
    }

    /**************************************\
    *             HOVER WINDOW             *
    \**************************************/

    show_hoverwindow(marker_info) {
        if (this.infowindow_marker_info == marker_info) {
            // The infowindow is already open for this marker; don't do anything
            return;
        }

        this._update_window_info(marker_info, this.hoverwindow_controls);
        this.hoverwindow.open(this.map, marker_info.marker);
    }

    hide_hoverwindow() {
        this.hoverwindow.close();
    }

    /**************************************\
    *             CENTER MARKER            *
    \**************************************/

    update_center_marker() {
        let geoodle = this.get_selected_geoodle();

        let lat = 0,
            lng = 0,
            point_count = 0;
        geoodle.markers.forEach(function(marker_info) {
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

    _get_participant_html(id, name, color, transport_mode) {
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
                    placeholder="Participant name"
                    type="text"
                    value="${name}"
                    style="
                        width: 65px;
                    "/>

                <button title="Participant transport mode" style="
                        background: url(${ICON_URLS['directions_'+transport_mode]})
                            no-repeat;
                        background-position-y: center;
                        background-position-x: 5px;
                        background-color: lightgrey;
                        background-size: 16px;
                        padding-left: 21px;
                        min-width: 26px;
                        height: 26px;
                        border: none;
                        border-radius: 5px;
                     "
                    class="participant_transport">
                    <span class="control_label" style="display: none;">
                        Participant transport mode
                    </span>
                </button>

                <button
                    class="remove_participant">
                    X
                </button>
            </div>`;
    }

    add_participant(id, name, color, transport_mode) {
        let geoodle = this.get_selected_geoodle();

        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (geoodle.participants[id] !== undefined) {
                id++;
            }
        }
        if (name === null || name === undefined) {
            name = chance.first();
        }
        if (color === null || color === undefined) {
            color = chance.color({format:'hex'});
        }
        if (transport_mode === null || transport_mode === undefined) {
            transport_mode = 'walk';
        }

        // Add them to the list of participants
        geoodle.participants[id] = {
            id: id,
            name: name,
            color: color,
            transport_mode: transport_mode
        };

        // Update UI
        this.controls.participant_list.append(
            this._get_participant_html(
                id,
                name,
                color,
                transport_mode
            )
        );

        // Let listeners know what's going on
        this.emit('add_participant', geoodle.participants[id]);
        this.emit('update');
    }

    toggle_participant_transport(id) {
        let geoodle = this.get_selected_geoodle();

        let index = TRANSPORT_MODES.indexOf(geoodle.participants[id].transport_mode);
        index = (index + 1) % TRANSPORT_MODES.length;
        this.update_participant(id, 'transport_mode', TRANSPORT_MODES[index]);
    }

    update_participant(id, attr, value) {
        let geoodle = this.get_selected_geoodle();

        // Update the participant
        geoodle.participants[id][attr] = value;

        // Update UI
        this.update_markers();
        this.update_selected_participant_color();
        this.update_infowindow(id);

        let participant_element = this.controls.participant_list.find(`[participant_id=${id}]`);
        participant_element.find('.participant_color').val(geoodle.participants[id].color);
        participant_element.find('.participant_name').val(geoodle.participants[id].name);
        participant_element.find('.participant_transport').css(
            'background-image',
            `url(${ICON_URLS['directions_'+geoodle.participants[id].transport_mode]})`
        );

        // Let listeners know what's going on
        this.emit('update_participant', geoodle.participants[id]);
        this.emit('update');
    }

    remove_participant(id) {
        let geoodle = this.get_selected_geoodle();

        // Remove the participant
        delete geoodle.participants[id];

        // Remove the participants markers
        geoodle.markers.filter(
            marker_info => marker_info.owner == id
        ).forEach(
            marker_info => this._remove_marker(marker_info)
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

        // Update which markers can be edited
        // TODO: Don't show hand icon over undraggable markers
        // TODO: Don't add a marker at the end of a failed drag
        // geoodle.markers.forEach(function(marker_info) {
        //     marker_info.marker.setDraggable(
        //         marker_info.owner == this.selected_participant_id
        //     );
        // }.bind(this));

        // Let listeners know what's going on
        this.emit('set_selected_participant', id);
        this.emit('update');
    }

    update_selected_participant_color() {
        let geoodle = this.get_selected_geoodle();

        let color = 'lightgrey';
        if (this.selected_participant_id !== null) {
            color = geoodle.participants[this.selected_participant_id].color;
        }
        this.controls.toggle_participant.css('background-color', color);
    }

    get_selected_participant() { 
        let geoodle = this.get_selected_geoodle();

        // If there are no participants, add one
        if (Object.keys(geoodle.participants).length === 0) {
            this.add_participant(null, null, null);
            noty({text: 'I added a default participant'});
        }

        // If there is no selected participant, select one
        if (this.selected_participant_id === null) {
            this.set_selected_participant(Object.keys(geoodle.participants)[0]);
            noty({text: 'I selected a participant'});
        }

        return this.selected_participant_id;
    }

    remove_all_participants() {
        let geoodle = this.get_selected_geoodle();

        Object.keys(geoodle.participants).forEach(
            participant_id => this.remove_participant(participant_id)
        );
        this.update_center_marker();
        this.emit('update');
    }

    /**************************************\
    *           TRANSPORT TIMES            *
    \**************************************/

    show_transport_times() {
        let geoodle = this.get_selected_geoodle();

        let participant_distances = {};

        // Destinations are the same for everyone
        let destinations = geoodle.markers.filter(
            marker_info => marker_info.type === 'suggestion'
        ).map(
            marker_info => marker_info.marker.getPosition()
        );
        let dms = new google.maps.DistanceMatrixService();

        Object.keys(geoodle.participants).forEach(function(participant_id) {
            let origins = geoodle.markers.filter(
                marker_info => marker_info.owner === participant_id && marker_info.type === 'point'
            ).map(
                marker_info => marker_info.marker.getPosition()
            );

            dms.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: google.maps.TravelMode[
                        TRANSPORT_MODE_MAP[
                            geoodle.participants[participant_id].transport_mode
                        ]
                    ]
                },
                dms_callback.bind(this, participant_id));
        }.bind(this));

        function dms_callback(participant_id, response, status) {
            if (status !== 'OK') {
                console.log(participant_id, response, status);
                alert('DMS failed!');
                return;
            }

            // Add results to participant_distances
            participant_distances[participant_id] = response.rows;

            // Check if participant_distances is complete
            if (Object.keys(participant_distances).length == Object.keys(geoodle.participants).length) {
                let HTML = this._get_transport_times_html(participant_distances);
                this._show_transport_times(HTML);
            }
        }
    }

    _get_transport_times_html(participant_distances) {
        let geoodle = this.get_selected_geoodle();

        let HTML = `
            <table border="1" style="
                    margin: auto;
                    margin-top: 10px;">
                <thead>
                    <!--Participant & Source-->
                    <th colspan="2"></th>
        `;

        // Destinations are the same for everyone
        let destinations = geoodle.markers.filter(
            marker_info => marker_info.type === 'suggestion'
        );

        // Constuct destination headers
        destinations.forEach(
            marker_info => HTML += `
                <th style="background-color: ${geoodle.participants[marker_info.owner].color};">
                    ${marker_info.label || '??'}
                </th>`
        );

        HTML += '</thead><tbody>';

        // Construct participant rows
        Object.keys(geoodle.participants).forEach(function(participant_id) {
            let participant = geoodle.participants[participant_id];
            let origins = geoodle.markers.filter(
                marker_info => marker_info.owner === participant_id && marker_info.type === 'point'
            );

            // Add participant header
            HTML += `
                <tr>
                    <td rowspan="${origins.length}" style="
                        background-color: ${participant.color};
                        ">
                        ${participant.name || '??'}
                        <br/>
                        <span title="Participant transport mode" style="
                            background: url(${ICON_URLS['directions_'+participant.transport_mode]})
                                no-repeat center;
                            background-color: lightgrey;
                            background-size: 16px;
                            min-width: 16px;
                            height: 16px;
                            padding: 5px;
                            border-radius: 5px;
                            display: inline-block;
                        ">
                        </span>

                    </td>`;

            // Construct origin rows
            origins.forEach(function(origin_marker_info, origin_index) {
                // Add origin header
                HTML += `
                    <td>
                        ${origin_marker_info.label || '??'}
                    </td>`;

                // Construct destination rows
                destinations.forEach(function(destination_marker_info, destination_index) {
                    let result = participant_distances[participant_id][origin_index].elements[destination_index];
                    // Add destination cell
                    HTML += `
                        <td style="text-align: right;">
                            ${result.duration.text}
                        </td>`;
                });

                // Close the row
                // TODO: Only open new TR if not last row
                HTML += '</tr><tr>';
            });
            // HAX
            HTML += '</tr>';

        }.bind(this));

        HTML += '</tbody></table>';

        return HTML;
    }

    _show_transport_times(HTML) {
        let control = $(`
            <div style="
                    position: absolute;
                    top: 0px;
                    bottom: 0px;
                    left: 0px;
                    right: 0px;
                    background-color: white;
                ">
                ${HTML}
            </div>
        `);
        $('body').append(control);

        control.click(function() {
            control.remove();
        });
    }

    /**************************************\
    *          GEOODLE MANAGEMENT          *
    \**************************************/



    _get_participant_html(id, name) {
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
                    placeholder="Participant name"
                    type="text"
                    value="${name}"
                    style="
                        width: 65px;
                    "/>

                <button title="Participant transport mode" style="
                        background: url(${ICON_URLS['directions_'+transport_mode]})
                            no-repeat;
                        background-position-y: center;
                        background-position-x: 5px;
                        background-color: lightgrey;
                        background-size: 16px;
                        padding-left: 21px;
                        min-width: 26px;
                        height: 26px;
                        border: none;
                        border-radius: 5px;
                     "
                    class="participant_transport">
                    <span class="control_label" style="display: none;">
                        Participant transport mode
                    </span>
                </button>

                <button
                    class="remove_participant">
                    X
                </button>
            </div>`;
    }

    add_participant(id, name) {
        let geoodle = this.get_selected_geoodle();

        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (geoodle.participants[id] !== undefined) {
                id++;
            }
        }
        if (name === null || name === undefined) {
            name = chance.first();
        }
        if (color === null || color === undefined) {
            color = chance.color({format:'hex'});
        }
        if (transport_mode === null || transport_mode === undefined) {
            transport_mode = 'walk';
        }

        // Add them to the list of participants
        geoodle.participants[id] = {
            id: id,
            name: name,
            color: color,
            transport_mode: transport_mode
        };

        // Update UI
        this.controls.participant_list.append(
            this._get_participant_html(
                id,
                name,
                color,
                transport_mode
            )
        );

        // Let listeners know what's going on
        this.emit('add_participant', geoodle.participants[id]);
        this.emit('update');
    }

    update_participant(id, attr, value) {
        let geoodle = this.get_selected_geoodle();

        // Update the participant
        geoodle.participants[id][attr] = value;

        // Update UI
        this.update_markers();
        this.update_selected_participant_color();
        this.update_infowindow(id);

        let participant_element = this.controls.participant_list.find(`[participant_id=${id}]`);
        participant_element.find('.participant_color').val(geoodle.participants[id].color);
        participant_element.find('.participant_name').val(geoodle.participants[id].name);
        participant_element.find('.participant_transport').css(
            'background-image',
            `url(${ICON_URLS['directions_'+geoodle.participants[id].transport_mode]})`
        );

        // Let listeners know what's going on
        this.emit('update_participant', geoodle.participants[id]);
        this.emit('update');
    }

    remove_participant(id) {
        let geoodle = this.get_selected_geoodle();

        // Remove the participant
        delete geoodle.participants[id];

        // Remove the participants markers
        geoodle.markers.filter(
            marker_info => marker_info.owner == id
        ).forEach(
            marker_info => this._remove_marker(marker_info)
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

        // Update which markers can be edited
        // TODO: Don't show hand icon over undraggable markers
        // TODO: Don't add a marker at the end of a failed drag
        // geoodle.markers.forEach(function(marker_info) {
        //     marker_info.marker.setDraggable(
        //         marker_info.owner == this.selected_participant_id
        //     );
        // }.bind(this));

        // Let listeners know what's going on
        this.emit('set_selected_participant', id);
        this.emit('update');
    }

    get_selected_geoodle() {
        let geoodle = this.get_selected_geoodle();

        // If there are no Geoodles, add one
        if (Object.keys(this.geoodles).length === 0) {
            this.add_geoodle(null, null, null);
            noty({text: 'I added a default Geoodle'});
        }

        // If there is no selected geoodle, select one
        if (this.selected_geoodle_id === null) {
            this.set_selected_geoodle(Object.keys(this.geoodles)[0]);
            noty({text: 'I selected a Geoodle'});
        }

        return this.geoodles[this.selected_geoodle_id];
    }



    /**************************************\
    *            SERIALISATION             *
    \**************************************/

    serialise() {
        let geoodle = this.get_selected_geoodle();

        /*
        {
            <geoodle_id>: {
                name: <geoodle_name>,
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
        }
        */
        let geoodles = {};

        Object.keys(this.geoodles).forEach(function(geoodle_id) {
            let geoodle = this.geoodles[geoodle_id];

            let markers = [];
            geoodle.markers.forEach(function(marker_info) {
                let latLng = marker_info.marker.getPosition();
                markers.push({
                    owner: marker_info.owner,
                    type: marker_info.type,
                    label: marker_info.label,
                    lat: latLng.lat(),
                    lng: latLng.lng()
                })
            });

            // Safari doesn't have object.values :(
            let participants = Object.keys(geoodle.participants).map(
                key => geoodle.participants[key]
            );

            geoodles[geoodle_id] = {
                name: geoodle.name,
                participants: participants,
                markers: markers
            };
        }.bind(this));

        return geoodles;
    }

    deserialise(input) {
        // Remove all participants & markers
        // this.remove_all_participants();

        if (input.participants) {
            // This was serialised before multiple Geoodles; update it!
            input = {
                _get_geoodle_id(): {
                    name: 'Hello, Geoodle!',
                    participants: input.participants,
                    markers: input.markers
                }
            };
        }

        // Load participants
        input.participants.forEach(
            participant => this.add_participant(
                participant.id,
                participant.name,
                participant.color,
                participant.transport_mode
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
