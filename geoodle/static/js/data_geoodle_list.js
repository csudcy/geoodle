
class GeoodleList {
    constructor() {
        this.geoodles = {};
        this._selected_geoodle_id = null;
    }

    /**************************************\
    *            SUB LIST MGMT             *
    \**************************************/

    add_geoodle(id, name) {
        // TODO
        // Validate input (see participant)
        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.geoodles[Geoodle.make_unique_id(id)] !== undefined) {
                id++;
            }
        }
        name = name || 'Hello, Geoodle!';

        let geoodle = new Geoodle(this, id, name);
        this._add_geoodle(geoodle);
    }

    _add_geoodle(geoodle) {
        this.geoodles[geoodle.unique_id] = geoodle;

        // Catch events
        geoodle.on('remove', function() {
            delete this.geoodles[geoodle.unique_id];
        });

        this.emit('add_geoodle', geoodle);
    }

    set_selected_geoodle(unique_id) {
        this._selected_geoodle_id = unique_id;
        this.emit('set_selected_geoodle', this.geoodles[unique_id]);
    }

    get_selected_geoodle() {
        // If there are no participants, add one
        if (!Object.keys(this.geoodles)) {
            this.add_geoodle();
            this.emit('notify', 'I added a Geoodle');
        }

        // If there is no selected participant, select one
        if (this.selected_participant_id === null) {
            let geoodle = Object.values(this.geoodles)[0];
            this.set_selected_participant(geoodle.unique_id);
            this.emit('notify', `I selected a Geoodle: "{geoodle.name}"`);
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
        console.log('Deserialise GeoodleList');

        input = this._convert_old_serialised_input(input);

        // Deserialise the list of Geoodle's
        input.geoodles.forEach(function(sub_input) {
            this._add_geoodle(
                Geoodle.deserialise(this, sub_input)
            );
        });

        if (input.selected_geoodle_id) {
            this.set_selected_geoodle(input.selected_geoodle_id);
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
