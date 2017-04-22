
class GeoodleList {
    constructor() {
        // Other stuff
        this._selected_geoodle_id = null;
        this.geoodles = {};
    }

    /**************************************\
    *            SUB LIST MGMT             *
    \**************************************/

    id_exists(unique_id) {
        return this.geoodles[unique_id] !== undefined;
    }

    add_geoodle(id, name) {
        // Create it & add it to the list
        let geoodle = new Geoodle(this, id, name);
        this.geoodles[geoodle.unique_id] = geoodle;

        // Catch events
        geoodle.on('remove', function() {
            // Remove the geoodle from my list of geoodles
            delete this.geoodles[geoodle.unique_id];

            // Unset selected geoodle if necessary
            if (this._selected_geoodle_id === geoodle.unique_id) {
                this._set_selected_geoodle(null);
            }
        }.bind(this));

        geoodle.on('select', function() {
            this._set_selected_geoodle(geoodle.unique_id);
        }.bind(this));

        this.emit('add_geoodle', geoodle);

        return geoodle;
    }

    _set_selected_geoodle(unique_id) {
        this._selected_geoodle_id = unique_id;

        // Update goodle visibility
        Object.values(this.geoodles).forEach(
            geoodle => geoodle.update('visible', geoodle.unique_id == unique_id)
        );

        this.emit('set_selected_geoodle', this.geoodles[unique_id]);
    }

    get_selected_geoodle(auto_add_and_select) {
        // If there are no geoodles, add one
        if (Object.keys(this.geoodles).length === 0) {
            if (auto_add_and_select === false) return;

            let geoodle = this.add_geoodle();
            this.emit('notify', `I added a Geoodle: "${geoodle.name}"`);
        }

        // If there is no selected geoodle, select one
        if (this._selected_geoodle_id === null || this._selected_geoodle_id === undefined) {
            if (auto_add_and_select === false) return;

            let geoodle = Object.values(this.geoodles)[0];
            this._set_selected_geoodle(geoodle.unique_id);
            this.emit('notify', `I selected a Geoodle: "${geoodle.name}"`);
        }

        return this.geoodles[this._selected_geoodle_id];
    }

    /**************************************\
    *                 MISC                 *
    \**************************************/

    /**************************************\
    *             SERIALISATION            *
    \**************************************/

    serialise() {
        return {
            selected_geoodle_id: this._selected_geoodle_id,
            geoodles: Object.values(this.geoodles).map(
                geoodle => geoodle.serialise()
            )
        };
    }

    deserialise(input) {
        input = this._convert_old_serialised_input(input);

        // Deserialise the list of Geoodle's
        input.geoodles.forEach(function(sub_input) {
            let geoodle = this.add_geoodle(sub_input.id);
            geoodle.deserialise(sub_input);
        }.bind(this));

        // Update extras
        if (input.selected_geoodle_id) {
            this._set_selected_geoodle(input.selected_geoodle_id);
        }
    }

    _convert_old_serialised_input(input) {
        // If this was serialised before multiple Geoodles; update it
        if (input.participants) {
            let participants_dict = {};

            input.participants.forEach(function(participant) {
                participant.markers = [];
                participants_dict[participant.id] = participant;
            });

            input.markers.forEach(function(marker_info, index) {
                marker_info.id = index;
                marker_info.position = {
                    lat: marker_info.lat,
                    lng: marker_info.lng
                };
                delete marker_info.lat;
                delete marker_info.lng;

                participants_dict[marker_info.owner].markers.push(marker_info);
            });

            return {
                selected_geoodle_id: 0,
                geoodles: [{
                    id: 0,
                    name: 'Hello, Geoodle!',
                    participants: input.participants
                }]
            };
        }

        return input;
    }
}

Emitter(GeoodleList.prototype);
