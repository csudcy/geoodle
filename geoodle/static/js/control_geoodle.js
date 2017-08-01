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
        klass: 'move_to_center',
        text: 'Move to current center',
        icon: ICON_URLS.center,
    }, {
        klass: 'show_hide_help',
        text: 'Show/hide help',
        icon: ICON_URLS.help,
    }
];

const TRANSPORT_MODE_MAP = {
    'walk': 'WALKING',
    'transit': 'TRANSIT',
    'car': 'DRIVING',
    'bike': 'BICYCLING'
};

// Object.values polyfill
// TODO: Check this works!
if (Object.values === undefined) {
    Object.values = function() {
        return Object.keys(this).map(
            key => this[key]
        );
    }
}


class GeoodleControl {
    /**************************************\
    *            INITIALISATION            *
    \**************************************/

    constructor(controlDiv, map, center) {
        this.map = map;
        this.center = center;

        this.geoodle_list = new GeoodleList();
        this.infowindow_geoodle_marker = null;
        this.marker_lookup = {};
        this.dragging_marker = false;

        this.init_controls(controlDiv);
        this.init_control_listeners();
        this.init_geoodle_button_listeners();
        this.init_participant_button_listeners();
        this.init_center_marker();
        this.init_map_listeners(map);
        this.init_noty();
        this.init_infowindow();
        this.init_infowindow_listeners();
        this.init_hoverwindow();

        this.init_geoodlelist_listeners();
    }

    _get_button_html(klass, text, icon) {
        return `
            <button title="${text}"
                style="background-image: url(${icon});"
                class="control_button ${klass}">
                <span class="control_label">
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
            <div class="container">
                <span class="button_container">
                    ${BUTTON_HTML}
                </span>

                <span class="list_container">
                    <div class="geoodle_container">
                        Geoodles:
                        <div class="geoodle_list">
                        </div>
                        <button class="add_geoodle">
                            Add Geoodle
                        </button>
                    </div>

                    <div class="participant_container">
                        Participants:
                        <div class="participant_list">
                        </div>
                        <button class="add_participant">
                            Add Participant
                        </button>
                    </div>
                </span>

                <div style="clear: both;">
                </div>
            </div>`);

        this.controlDiv = controlDiv;
        this.controls = {
            // Main buttons
            toggle_geoodle: controlDiv.find('.toggle_geoodle'),
            toggle_participant: controlDiv.find('.toggle_participant'),
            toggle_add_mode: controlDiv.find('.toggle_add_mode'),
            show_transport_times: controlDiv.find('.show_transport_times'),
            move_to_center: controlDiv.find('.move_to_center'),
            show_hide_help: controlDiv.find('.show_hide_help'),

            // Participant buttons
            participant_list: controlDiv.find('.participant_list'),
            add_participant: controlDiv.find('.add_participant'),

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
            this.geoodle_list.get_selected_geoodle().toggle_add_mode();
        }.bind(this));

        this.controls.show_transport_times.click(function() {
            this.show_transport_times();
        }.bind(this));

        this.controls.move_to_center.click(function() {
            this.move_to_center();
        }.bind(this));

        this.controls.show_hide_help.click(function() {
            // Have to do this live as participant help need toggling too
            this.controlDiv.find('.control_label').toggle();
        }.bind(this));
    }

    init_geoodle_button_listeners() {
        this.controls.add_geoodle.click(function() {
            this.geoodle_list.add_geoodle();
        }.bind(this));

        this.controls.geoodle_list.on('change', '[name="selected_geoodle"]', function(e) {
            let target = $(e.target);
            let geoodle = target.parent().data('geoodle');
            geoodle.select();
        }.bind(this))

        this.controls.geoodle_list.on('change', '.geoodle_name', function(e) {
            let target = $(e.target);
            let geoodle = target.parent().data('geoodle');
            geoodle.update('name', target.val());
        }.bind(this))

        this.controls.geoodle_list.on('click', '.remove_geoodle', function(e) {
            let target = $(e.target);
            let geoodle = target.parent().data('geoodle');
            geoodle.remove();
        }.bind(this))
    }

    init_participant_button_listeners() {
        this.controls.add_participant.click(function() {
            this.geoodle_list.get_selected_geoodle().add_participant();
        }.bind(this));

        this.controls.participant_list.on('change', '[name="selected_participant"]', function(e) {
            let target = $(e.target);
            let participant = target.parent().data('participant');
            participant.select();
        }.bind(this))

        this.controls.participant_list.on('change', '.participant_color', function(e) {
            let target = $(e.target);
            let participant = target.parent().data('participant');
            participant.update('color', target.val());
        }.bind(this))

        this.controls.participant_list.on('change', '.participant_name_input', function(e) {
            let target = $(e.target);
            let participant = target.parent().data('participant');
            participant.update('name', target.val());
        }.bind(this))

        this.controls.participant_list.on('click', '.participant_transport', function(e) {
            let target = $(e.target);
            let participant = target.parent().data('participant');
            participant.toggle_transport_mode();
        }.bind(this))

        this.controls.participant_list.on('click', '.remove_participant', function(e) {
            let target = $(e.target);
            let participant = target.parent().data('participant');
            participant.remove();
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
            if (this.infowindow_geoodle_marker !== null) {
                return this.hide_infowindow();
            }

            this.geocode(e.latLng, function(label) {
                let geoodle = this.geoodle_list.get_selected_geoodle();
                geoodle.get_selected_participant().add_marker(
                    null, geoodle.add_mode, e.latLng.lat(), e.latLng.lng(), label
                );
            }.bind(this));
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
                    <span>
                        <span class="participant_icon">
                        </span>
                        <span class="participant_name">
                        </span>
                    </span>
                    <span class="delete_marker">
                    </span>
                </div>
                <span>
                    <input class="participant_description"
                        type="text"
                        placeholder="Description"/>
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
            icon: infowindow_div.find('.participant_icon'),
            name: infowindow_div.find('.participant_name'),
            description_input: infowindow_div.find('.participant_description'),
            delete_marker: infowindow_div.find('.delete_marker'),
        };
    }

    init_infowindow_listeners() {
        this.infowindow_controls.delete_marker.click(function() {
            // Remove the marker
            this.infowindow_geoodle_marker.remove();
        }.bind(this));

        this.infowindow_controls.icon.click(function() {
            // Flip the marker type
            if (this.infowindow_geoodle_marker.type != 'point') {
                this.infowindow_geoodle_marker.update('type', 'point');
            } else {
                this.infowindow_geoodle_marker.update('type', 'suggestion');
            }
        }.bind(this));

        this.infowindow_controls.description_input.on('change', function() {
            // Save the new description
            this.infowindow_geoodle_marker.update(
                'label',
                this.infowindow_controls.description_input.val()
            );
        }.bind(this));
    }

    init_hoverwindow() {
        let html = `
            <div class="info_popup">
                <div class="top_row">
                    <span class="">
                        <span class="participant_icon">
                        </span>
                        <span class="participant_name">
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
            icon: hoverwindow_div.find('.participant_icon'),
            name: hoverwindow_div.find('.participant_name'),
            description: hoverwindow_div.find('.description'),
        };
    }

    /**************************************\
    *            DATA LISTENERS            *
    \**************************************/

    init_geoodlelist_listeners() {
        this.geoodle_list.on('notify',
            text => noty({text: text})
        );

        this.geoodle_list.on('add_geoodle', function(geoodle) {
            // Update UI
            let geoodle_element = $(this._get_geoodle_html(geoodle));
            geoodle_element.data('geoodle', geoodle);
            this.controls.geoodle_list.append(geoodle_element);

            // Add listeners
            this.init_geoodle_listeners(geoodle);

            // Select the new Geoodle
            geoodle.select();

            this.emit_debounce(1000, 'update');
        }.bind(this));

        this.geoodle_list.on('set_selected_geoodle', function(geoodle) {
            // Update UI
            this.hide_infowindow();
            this.hide_hoverwindow();

            // Update selected input for Geoodle
            this.controls.geoodle_list.find(
                `[geoodle_id] input[type="radio"]`
            ).prop('checked', false);
            if (geoodle) {
                this.controls.geoodle_list.find(
                    `[geoodle_id=${geoodle.unique_id}] input[type="radio"]`
                ).prop('checked', true);
            }

            // HACK: Re-select selected participant so the radio button is checked
            if (geoodle) {
                let participant = geoodle.get_selected_participant(false);
                if (participant) {
                    participant.select();
                }
            }

            // HACK: Re-set add_mode so the icon is correct
            if (geoodle) {
                geoodle.set_add_mode(geoodle.add_mode);
            }

            // Emit update_title so it can be displayed nicely
            this.update_selected_geoodle_title();
        }.bind(this));
    }

    init_geoodle_listeners(geoodle) {
        geoodle.on('notify',
            text => noty({text: text})
        );

        geoodle.on('update', function() {
            // Update UI
            let geoodle_element = this.controls.geoodle_list.find(`[geoodle_id=${geoodle.unique_id}]`);
            geoodle_element.find('.geoodle_name').val(geoodle.name);

            // HACK: Always update the title (even if it hasn't changed)
            this.update_selected_geoodle_title();

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle.on('remove', function() {
            // Update UI
            this.controls.geoodle_list.find(
                `[geoodle_id=${geoodle.unique_id}]`
            ).remove();

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle.on('add_participant', function(geoodle_participant) {
            // Update UI
            let participant_element = $(this._get_participant_html(geoodle_participant));
            participant_element.data('participant', geoodle_participant);
            this.controls.participant_list.append(participant_element);

            // Add listeners
            this.init_geoodleparticipant_listeners(geoodle_participant);

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle.on('set_selected_participant', function(geoodle_participant) {
            // Update UI
            this.update_selected_participant_color();

            // Update selected input
            this.controls.participant_list.find(
                `[participant_id] input[type="radio"]`
            ).prop('checked', false);
            if (geoodle_participant) {
                this.controls.participant_list.find(
                    `[participant_id=${geoodle_participant.unique_id}] input[type="radio"]`
                ).prop('checked', true);
            }

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle.on('set_add_mode', function(add_mode) {
            this.controls.toggle_add_mode.css(
                'background-image',
                `url(${ICON_URLS[add_mode]})`
            );
        }.bind(this));
    }

    init_geoodleparticipant_listeners(geoodle_participant) {
        geoodle_participant.on('notify',
            text => noty({text: text})
        );

        geoodle_participant.on('update', function() {
            // Update UI
            // HACK: Always update the color (even if it hasn't changed)
            this.update_selected_participant_color();
            this.update_infowindow(geoodle_participant.unique_id);

            let participant_element = this.controls.participant_list.find(`[participant_id=${geoodle_participant.unique_id}]`);
            participant_element.find('.participant_color').val(geoodle_participant.color);
            participant_element.find('.participant_name_input').val(geoodle_participant.name);
            participant_element.find('.participant_transport').css(
                'background-image',
                `url(${ICON_URLS['directions_'+geoodle_participant.transport_mode]})`
            );

            if (geoodle_participant.visible) {
                participant_element.show();
            } else {
                participant_element.hide();
            }

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle_participant.on('remove', function() {
            // Update UI
            this.controls.participant_list.find(
                `[participant_id=${geoodle_participant.unique_id}]`
            ).remove();

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle_participant.on('add_marker', function(geoodle_marker) {
            // Update UI
            let gmaps_marker = new google.maps.Marker({
                icon: {
                    path: SVG_PATHS[geoodle_marker.type],
                    fillColor: geoodle_participant.color,
                    fillOpacity: 1,
                    anchor: {x: 12, y: 12}
                },
                position: geoodle_marker.position,
                map: this.map,
                draggable: true
            });

            this.marker_lookup[geoodle_marker.unique_id] = gmaps_marker;

            gmaps_marker.addListener('click', function() {
                this.show_infowindow(geoodle_marker);
            }.bind(this));

            gmaps_marker.addListener('drag', function() {
                this.dragging_marker = true;
                let latLng = gmaps_marker.getPosition();
                geoodle_marker.update('position', {
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                });
            }.bind(this));

            gmaps_marker.addListener('dragend', function() {
                this.dragging_marker = false;
                let latLng = gmaps_marker.getPosition();
                geoodle_marker.update('position', {
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                });
            }.bind(this));

            gmaps_marker.addListener('mouseover', function() {
                this.show_hoverwindow(geoodle_marker);
            }.bind(this));

            gmaps_marker.addListener('mouseout', function() {
                this.hide_hoverwindow();
            }.bind(this));

            // Add listeners
            this.init_geoodlemarker_listeners(geoodle_marker);

            // Update anything dependent on markers
            this.update_center_marker();

            this.emit_debounce(1000, 'update');
        }.bind(this));
    }

    init_geoodlemarker_listeners(geoodle_marker) {
        geoodle_marker.on('notify',
            text => noty({text: text})
        );

        geoodle_marker.on('update', function() {
            // Only do some updates when this is not a drag update
            if (!this.dragging_marker) {
                let gmaps_marker = this.marker_lookup[geoodle_marker.unique_id];
                gmaps_marker.setIcon({
                    path: SVG_PATHS[geoodle_marker.type],
                    fillColor: geoodle_marker.participant.color,
                    fillOpacity: gmaps_marker.icon.fillOpacity,
                    anchor: gmaps_marker.icon.anchor
                });

                gmaps_marker.setPosition(geoodle_marker.position);

                if (geoodle_marker.visible) {
                    gmaps_marker.setMap(this.map);
                } else {
                    gmaps_marker.setMap(null);
                }

                this.update_infowindow();
            }

            // Update anything dependent on markers
            this.update_center_marker();

            this.emit_debounce(1000, 'update');
        }.bind(this));

        geoodle_marker.on('remove', function() {
            // If the info window belongs to this marker, close it
            if (geoodle_marker == this.infowindow_geoodle_marker) {
                this.hide_infowindow();
            }

            // Remove the given marker
            let gmaps_marker = this.marker_lookup[geoodle_marker.unique_id];
            gmaps_marker.setMap(null);
            delete this.marker_lookup[geoodle_marker.unique_id];

            // Update anything dependent on markers
            this.update_center_marker();
        }.bind(this));
    }

    /**************************************\
    *              INFO WINDOW             *
    \**************************************/

    show_infowindow(geoodle_marker) {
        if (this.infowindow_geoodle_marker == geoodle_marker) {
            // This is already the open window; close it
            this.hide_infowindow();
            return;
        }

        this.infowindow_geoodle_marker = geoodle_marker;

        this.hide_hoverwindow();
        this.update_infowindow();
        this.infowindow.open(this.map, this.marker_lookup[geoodle_marker.unique_id]);

        this.infowindow_controls.description_input.focus();
        this.infowindow_controls.description_input.select();
    }

    update_infowindow(updated_participant_id) {
        // updated_participant_id (optional): The participant that is being updated
        if (!this.infowindow_geoodle_marker) {
            // There is no info_window open
            return;
        }

        this._update_window_info(this.infowindow_geoodle_marker, this.infowindow_controls);
    }

    hide_infowindow() {
        this.infowindow_geoodle_marker = null;
        this.infowindow.close();
    }

    /**************************************\
    *             HOVER WINDOW             *
    \**************************************/

    show_hoverwindow(geoodle_marker) {
        if (this.infowindow_geoodle_marker == geoodle_marker) {
            // The infowindow is already open for this marker; don't do anything
            return;
        }

        this._update_window_info(geoodle_marker, this.hoverwindow_controls);
        this.hoverwindow.open(this.map, this.marker_lookup[geoodle_marker.unique_id]);
    }

    hide_hoverwindow() {
        this.hoverwindow.close();
    }

    /**************************************\
    *             SHARED WINDOW            *
    \**************************************/

    _update_window_info(geoodle_marker, controls) {
        controls.icon.css({
            'background-image': `url(${ICON_URLS[geoodle_marker.type]}) no-repeat center`,
            'background-color': geoodle_marker.participant.color
        });
        controls.name.text(
            geoodle_marker.participant.name
        );
        if (controls.description_input) {
            controls.description_input.val(
                geoodle_marker.label
            );
        } else {
            controls.description.text(
                geoodle_marker.label
            );
        }
    }

    /**************************************\
    *             CENTER MARKER            *
    \**************************************/

    update_center_marker() {
        let center = null;
        let geoodle = this.geoodle_list.get_selected_geoodle(false);
        if (geoodle) {
            center = geoodle.get_center();
        }
        this.center_marker.setPosition(center || this.center);
    }

    move_to_center() {
        this.map.panTo(this.center_marker.getPosition());
    }

    /**************************************\
    *          GEOODLE MANAGEMENT          *
    \**************************************/

    _get_geoodle_html(geoodle) {
        return `
            <div geoodle_id="${geoodle.unique_id}">
                <input
                    type="radio"
                    name="selected_geoodle">
                <input
                    class="geoodle_name"
                    title="Enter Geoodle's name"
                    placeholder="Geoodle name"
                    type="text"
                    value="${geoodle.name}"/>

                <button class="remove_geoodle">
                    X
                </button>
            </div>`;
    }

    update_selected_geoodle_title() {
        let title;
        let geoodle = this.geoodle_list.get_selected_geoodle(false);
        if (geoodle) {
            title = geoodle.name;
        }
        this.emit('update_title', title);
    }

    /**************************************\
    *        PARTICIPANT MANAGEMENT        *
    \**************************************/

    _get_participant_html(geoodle_participant) {
        return `
            <div
                participant_id="${geoodle_participant.unique_id}">
                <input
                    type="radio"
                    name="selected_participant">
                <input
                    class="participant_color"
                    title="Set participant colour"
                    type="color"
                    value="${geoodle_participant.color}"/>
                <input
                    class="participant_name_input"
                    title="Enter participants name"
                    placeholder="Participant name"
                    type="text"
                    value="${geoodle_participant.name}"/>

                <button
                    class="participant_transport"
                    title="Participant transport mode">
                    <span class="control_label">
                        Participant transport mode
                    </span>
                </button>

                <button
                    class="remove_participant">
                    X
                </button>
            </div>`;
    }

    update_selected_participant_color() {
        // Get the selected participant but don't add anything!
        let geoodle_participant;
        let selected_geoodle = this.geoodle_list.get_selected_geoodle(false);
        if (selected_geoodle) {
            geoodle_participant = selected_geoodle.get_selected_participant(false);
        }

        // Update the color
        let color = 'lightgrey';
        if (geoodle_participant) {
            color = geoodle_participant.color;
        }
        this.controls.toggle_participant.css('background-color', color);
    }

    /**************************************\
    *           TRANSPORT TIMES            *
    \**************************************/

    show_transport_times() {
        let transport_info_dict = this._get_transport_info_dict();
        if (this._validate_transport_info_dict(transport_info_dict)) {
            this._get_distance_matrices(
                transport_info_dict,
                function(participant_distances) {
                    let HTML = this._get_transport_times_html(
                        transport_info_dict,
                        participant_distances
                    );
                    this._show_transport_times(HTML);
                }.bind(this));
        }
    }

    _get_transport_info_dict() {
        let geoodle = this.geoodle_list.get_selected_geoodle();

        // Destinations are the same for everyone
        let destination_positions = [];
        let destination_markers = [];

        // Sources are per-participant
        let participant_infos = [];

        Object.values(geoodle.participants).forEach(function(participant) {
            let origin_positions = [];
            let origin_markers = [];

            Object.values(participant.markers).forEach(function(geoodle_marker) {
                if (geoodle_marker.type === 'suggestion') {
                    destination_positions.push(geoodle_marker.position);
                    destination_markers.push(geoodle_marker);
                } else {
                    origin_positions.push(geoodle_marker.position);
                    origin_markers.push(geoodle_marker);
                }
            });

            // Add the participant to the list if they have origins
            if (origin_positions.length > 0) {
                participant_infos.push({
                    participant: participant,
                    origin_positions: origin_positions,
                    origin_markers: origin_markers
                });
            }
        });

        return {
            destination_positions: destination_positions,
            destination_markers: destination_markers,
            participant_infos: participant_infos,
        };
    }

    _validate_transport_info_dict(transport_info_dict) {
        // Check for errors
        let valid = true;
        if (transport_info_dict.participant_infos.length === 0) {
            noty({text: 'You must add some points before you can get travel times!'});
            valid = false;
        }
        if (transport_info_dict.destination_positions.length === 0) {
            noty({text: 'You must add some suggestions before you can get travel times!'});
            valid = false;
        }
        return valid;
    }

    _get_distance_matrices(transport_info_dict, final_callback) {
        let dms = new google.maps.DistanceMatrixService();

        transport_info_dict.participant_infos.forEach(function(participant_info) {
            dms.getDistanceMatrix({
                    origins: participant_info.origin_positions,
                    destinations: transport_info_dict.destination_positions,
                    travelMode: google.maps.TravelMode[
                        TRANSPORT_MODE_MAP[
                            participant_info.participant.transport_mode
                        ]
                    ]
                },
                dms_callback.bind(this, participant_info.participant.unique_id));
        }.bind(this));

        let participant_distances = {};
        function dms_callback(participant_unique_id, response, status) {
            if (status !== 'OK') {
                console.log(participant_unique_id, response, status);
                alert('DMS failed!');
                return;
            }

            // Add results to participant_distances
            participant_distances[participant_unique_id] = response.rows;

            // Check if participant_distances is complete
            if (Object.keys(participant_distances).length == transport_info_dict.participant_infos.length) {
                final_callback(participant_distances);
            }
        }
    }

    _get_transport_times_html(transport_info_dict, participant_distances) {
        let HTML = `
            <table
                class="transport_times"
                border="1">
                <thead>
                    <!--Participant & Source-->
                    <th colspan="2"></th>
        `;

        // Constuct destination headers
        transport_info_dict.destination_markers.forEach(
            geoodle_marker => HTML += `
                <th style="background-color: ${geoodle_marker.participant.color};">
                    ${geoodle_marker.label || '??'}
                </th>`
        );

        HTML += '</thead><tbody>';

        // Construct participant rows
        transport_info_dict.participant_infos.forEach(function(participant_info) {
            // Add participant header
            HTML += `
                <tr>
                    <td rowspan="${participant_info.origin_markers.length}"
                        style="background-color: ${participant_info.participant.color};">
                        ${participant_info.participant.name || '??'}
                        <br/>
                        <span
                            class="transport_mode"
                            title="Participant transport mode"
                            style="background-image: url(${ICON_URLS['directions_'+participant_info.participant.transport_mode]});">
                        </span>
                    </td>`;

            // Construct origin rows
            participant_info.origin_markers.forEach(function(source_geoodle_marker, origin_index) {
                // Add origin header
                HTML += `
                    <td>
                        ${source_geoodle_marker.label || '??'}
                    </td>`;

                // Construct destination rows
                transport_info_dict.destination_markers.forEach(function(destination_geoodle_marker, destination_index) {
                    let result = participant_distances[participant_info.participant.unique_id][origin_index].elements[destination_index];
                    // Add destination cell
                    HTML += `
                        <td class="transport_time">
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
            <div class="transport_times_overlay">
                ${HTML}
            </div>
        `);
        $('body').append(control);

        control.click(function() {
            control.remove();
        });
    }

    /**************************************\
    *                 MISC                 *
    \**************************************/

    geocode(latLng, callback) {
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

                callback(label);
            });
    }

    serialise() {
        return this.geoodle_list.serialise();
    }

    deserialise(input) {
        this.geoodle_list.deserialise(input);
    }
}

Emitter(GeoodleControl.prototype);
