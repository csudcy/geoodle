
class Marker {
    constructor(participant, id, type, lat, lng, label) {
        // Save parent
        this.participant = participant;

        // Validate input
        type = type || 'point';
        lat = lat || 0;
        lng = lng || 0;
        label = label || 'No label';

        // Save attributes
        this._set_id(id);
        this.type = type;
        this.lat = lat;
        this.lng = lng;
        this.label = label;
    }

    _make_unique_id(id) {
        return `${this.participant.unique_id}_marker_${id || this.id}`;
    }

    _set_id(id) {
        // Check ID is not actually changing
        if (this.id !== null && this.id !== undefined) {
            if (this.id !== id) {
                throw new Error(`You cannot change Marker ID from ${this.id} to ${id}!`);
            }
        }

        if (id === null || id === undefined) {
            // Find an id for this participant
            id = 0;
            while (this.participant.id_exists(this._make_unique_id(id))) {
                id++;
            }
        }
        this.id = id;
        this.unique_id = this._make_unique_id();
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

    deserialise(input) {
        console.log('Deserialise Marker');

        // Update my attributes
        this._set_id(input.id);
        this.update('type', input.type);
        this.update('lat', input.lat);
        this.update('lng', input.lng);
        this.update('label', input.label);
    }
}

Emitter(Marker.prototype);
