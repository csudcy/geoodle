
class Marker {
    constructor(participant, id, type, lat, lng, label) {
        this.participant = participant;

        this.id = id;
        this.type = type;
        this.lat = lat;
        this.lng = lng;
        this.label = label;

        this.unique_id = Marker.make_unique_id(participant, id);
    }

    static make_unique_id(participant, id) {
        return `${participant.unique_id}_marker_${id}`;
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
        this.participant.remove_marker(this);
        this.emit('remove');
    }

    /**************************************\
    *             SERIALISATION            *
    \**************************************/

    serialise() {
        return         {
            type: this.type,
            lat: this.lat,
            lng: this.lng,
            label: this.label
        };
    }

    static deserialise(participant, input) {
        console.log('Deserialise Marker');

        return new Marker(
            participant,
            input.type,
            input.lat,
            input.lng,
            input.label
        );
    }
}

Emitter(Marker.prototype);
