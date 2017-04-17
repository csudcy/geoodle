
class Geoodle {
    constructor(geoodle_list, id, name) {
        this.geoodle_list = geoodle_list;

        this.id = id;
        this.name = name;
        this.participants = {};
        this.selected_participant = null;
        this.add_mode = 'point';

        this.unique_id = Geoodle.make_unique_id(id);
    }

    static make_unique_id(id) {
        return `geoodle_${id}`;
    }

    /**************************************\
    *            SUB LIST MGMT             *
    \**************************************/

    add_participant(id, name, color, transport_mode) {
        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.participants[Participant.make_unique_id(this, id)] !== undefined) {
                id++;
            }
        }
        name = name || chance.first();
        color = color || chance.color({format:'hex'});
        transport_mode = transport_mode || 'walk';

        // Add them to the list of participants
        let participant = new Participant(
            this,
            id,
            name,
            color,
            transport_mode
        );
        this._add_participant(participant);
    }

    _add_participant(participant) {
        this.participants[participant.unique_id] = participant;

        // Catch events
        participant.on('remove', function() {
            delete this.participants[participant.unique_id];
        });

        this.emit('add_participant', participant);
    }

    set_selected_participant(unique_id) {
        this.selected_participant_id = participant_id;
        this.emit('set_selected_participant', this.participants[participant_id]);
    }

    get_selected_participant() {
        // If there are no participants, add one
        if (Object.keys(geoodle.participants).length === 0) {
            this.add_participant();
            this.emit('notify', 'I added a default participant');
        }

        // If there is no selected participant, select one
        if (this.selected_participant_id === null) {
            this.set_selected_participant(Object.keys(geoodle.participants)[0]);
            this.emit('notify', 'I selected a participant');
        }

        return this.participants[this.selected_participant_id];
    }

    /**************************************\
    *                 MISC                 *
    \**************************************/

    toggle_add_mode() {
        if (this.add_mode != 'point') {
            this.add_mode = 'point';
        } else {
            this.add_mode = 'suggestion';
        }
        this.emit('set_add_mode', this.add_mode);
    }

    get_center() {
        let lat = 0,
            lng = 0,
            point_count = 0;

        this.participants.forEach(function(participant) {
            participant.markers.forEach(function(marker) {
                if (marker.type == 'point') {
                    lat += marker.lat;
                    lng += marker.lng;
                    point_count++;
                }
            });
        });

        if (point_count <= 1) return;

        lat /= point_count;
        lng /= point_count;
        return {
            lat: lat,
            lng: lng
        };
    }

    /**************************************\
    *             SERIALISATION            *
    \**************************************/

    serialise() {
        return {
            id: this.id,
            name: this.name,
            selected_participant_id: this.selected_participant_id,
            add_mode: this.add_mode,
            participants: Object.values(this.participants).map(
                participant => participant.serialise()
            )
        };
    }

    static deserialise(geoodle_list, input) {
        console.log('Deserialise Geoodle');

        let geoodle = new Geoodle(geoodle_list, input.id, input.name);

        // Deserialise the list of participants
        input.participants.forEach(function(sub_input) {
            geoodle._add_participant(
                Participant.deserialise(geoodle, sub_input)
            );
        });

        if (input.selected_participant_id) {
            this.set_selected_participant(input.selected_participant_id);
        }
        if (input.add_mode) {
            this.set_add_mode(input.add_mode);
        }
        return geoodle;
    }
}

Emitter(Geoodle.prototype);
