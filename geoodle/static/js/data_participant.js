
const TRANSPORT_MODES = [
    'walk',
    'transit',
    'car',
    'bike'
];


class Participant {
    constructor(geoodle, id, name, color, transport_mode) {
        // Save parent
        this.geoodle = geoodle;

        // Validate input
        name = name || chance.first();
        color = color || chance.color({format:'hex'});
        transport_mode = transport_mode || 'walk';

        // Save attributes
        this._set_id(id);
        this.name = name;
        this.color = color;
        this.transport_mode = transport_mode;

        // Other stuff
        this.markers = {};
    }

    _make_unique_id(id) {
        return `${this.geoodle.unique_id}_participant_${id || this.id}`;
    }

    _set_id(id) {
        // Check ID is not actually changing
        if (this.id !== null && this.id !== undefined) {
            if (this.id !== id) {
                throw new Error(`You cannot change Participant ID from ${this.id} to ${id}!`);
            }
        }

        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.geoodle.id_exists(this._make_unique_id(id))) {
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
        return this.markers[unique_id] !== undefined;
    }

    add_marker(id, type, lat, lng, label) {
        // Create it & add it to the list
        let marker = new Marker(this, id, type, lat, lng, label);
        this.markers[marker.unique_id] = marker;

        // Catch events
        marker.on('remove', function() {
            delete this.markers[marker.unique_id];
        });

        this.emit('add_marker', marker);

        return marker;
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
        // let geoodle = this.get_selected_geoodle();

        // // Remove the participant
        // delete geoodle.participants[id];

        // // Remove the participants markers
        // geoodle.markers.filter(
        //     marker_info => marker_info.owner == id
        // ).forEach(
        //     marker_info => this._remove_marker(marker_info)
        // );
        // this.update_center_marker();

        // // Unset selected participant if necessary
        // if (this.selected_participant_id === id) {
        //     this.set_selected_participant(null);
        // }

        this.emit('remove');
    }

    toggle_transport_mode() {
        let index = TRANSPORT_MODES.indexOf(this.transport_mode);
        index = (index + 1) % TRANSPORT_MODES.length;
        this.update_participant(id, 'transport_mode', TRANSPORT_MODES[index]);

        this.emit('update');
    }

    /**************************************\
    *             SERIALISATION            *
    \**************************************/

    serialise() {
        return         {
            id: this.id,
            name: this.name,
            color: this.color,
            transport_mode: this.transport_mode,
            markers: Object.values(this.markers).map(
                marker => marker.serialise()
            )
        };
    }

    deserialise(input) {
        console.log('Deserialise Participant');

        // Update my attributes
        this._set_id(input.id);
        this.update('name', input.name);
        this.update('color', input.color);
        this.update('transport_mode', input.transport_mode);

        // Deserialise the list of markers
        input.markers.forEach(function(sub_input) {
            let marker = this.add_marker(sub_input.id);
            marker.deserialise(sub_input);
        }.bind(this));
    }
}

Emitter(Participant.prototype);
