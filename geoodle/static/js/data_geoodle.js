
class Geoodle {
    constructor(geoodle_list, id, name) {
        // Save parent
        this.geoodle_list = geoodle_list;

        // Validate input
        name = name || 'Hello, Geoodle!';

        // Save attributes
        this._set_id(id);
        this.name = name;

        // Other stuff
        this.participants = {};
        this.selected_participant = null;
        this.add_mode = 'point';
    }

    _make_unique_id(id) {
        return `geoodle_${id || this.id}`;
    }

    _set_id(id) {
        // Check ID is not actually changing
        if (this.id !== null && this.id !== undefined) {
            if (this.id !== id) {
                throw new Error(`You cannot change Geoodle ID from ${this.id} to ${id}!`);
            }
        }

        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.geoodle_list.id_exists(this._make_unique_id(id))) {
                id++;
            }
        }
        this.id = id;
        this.unique_id = this._make_unique_id();
    }

    /**************************************\
    *            SUB LIST MGMT             *
    \**************************************/

    id_exists(unique_id) {
        return this.participants[unique_id] !== undefined;
    }

    add_participant(id, name, color, transport_mode) {
        // Create it & add it to the list
        let participant = new Participant(
            this,
            id,
            name,
            color,
            transport_mode
        );
        this.participants[participant.unique_id] = participant;

        // Catch events
        participant.on('remove', function() {
            delete this.participants[participant.unique_id];
        });

        this.emit('add_participant', participant);

        return participant;
    }

    set_selected_participant(unique_id) {
        this.selected_participant_id = participant_id;
        this.emit('set_selected_participant', this.participants[participant_id]);
    }

    get_selected_participant() {
        // If there are no participants, add one
        if (Object.keys(this.participants).length === 0) {
            this.add_participant();
            this.emit('notify', 'I added a default participant');
        }

        // If there is no selected participant, select one
        if (this.selected_participant_id === null) {
            this.set_selected_participant(Object.keys(this.participants)[0]);
            this.emit('notify', 'I selected a participant');
        }

        return this.participants[this.selected_participant_id];
    }

    /**************************************\
    *                 MISC                 *
    \**************************************/

    update(attr, value) {
        // Check this can be updated
        if (attr == 'id') throw new Error('You cnanot update ID!');

        // Save updated attribute
        this[attr] = value;
        this.emit('update');
    }

    remove() {
        // TODO
    }

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

    deserialise(input) {
        console.log('Deserialise Geoodle');

        // Update my attributes
        this._set_id(input.id);
        this.update('name', input.name);

        // Deserialise the list of participants
        input.participants.forEach(function(sub_input) {
            let participant = this.add_participant(sub_input.id);
            participant.deserialise(sub_input);
        }.bind(this));

        // Update extras
        if (input.selected_participant_id) {
            this.set_selected_participant(input.selected_participant_id);
        }
        if (input.add_mode) {
            this.set_add_mode(input.add_mode);
        }
    }
}

Emitter(Geoodle.prototype);
