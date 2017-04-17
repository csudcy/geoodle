
const TRANSPORT_MODES = [
    'walk',
    'transit',
    'car',
    'bike'
];


class Participant {
    constructor(geoodle, id, name, color, transport_mode) {
        this.geoodle = geoodle;

        this.id = id;
        this.name = name;
        this.color = color;
        this.transport_mode = transport_mode;
        this.markers = {};

        this.unique_id = Participant.make_unique_id(geoodle, id);
    }

    static make_unique_id(geoodle, id) {
        return `${geoodle.unique_id}_participant_${id}`;
    }

    /**************************************\
    *            SUB LIST MGMT             *
    \**************************************/

    add_marker(id, type, lat, lng, label) {
        // TODO
        // Validate input (see participant)
        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.markers[Marker.make_unique_id(this, id)] !== undefined) {
                id++;
            }
        }
        type = type || 'point';
        lat = lat || 0;
        lng = lng || 0;
        label = label || 'No label';

        let marker = new Marker(this, id, type, lat, lng, label);
        this._add_marker(marker);
    }

    _add_marker(marker) {
        this.markers[marker.unique_id] = marker;

        // Catch events
        marker.on('remove', function() {
            delete this.markers[marker.unique_id];
        });

        this.emit('add_marker', marker);
    }

    /**************************************\
    *                 MISC                 *
    \**************************************/

    update(attr, value) {
        // TODO
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

    static deserialise(geoodle, input) {
        console.log('Deserialise Participant');

        let participant = new Participant(
            geoodle,
            input.id,
            input.name,
            input.color,
            input.transport_mode);

        // Deserialise the list of markers
        input.markers.forEach(function(sub_input) {
            participant._add_marker(
                Marker.deserialise(participant, sub_input)
            );
        });

        return participant;
    }
}

Emitter(Participant.prototype);
