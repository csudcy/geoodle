
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
        this.position = {
            lat: lat,
            lng: lng
        };
        this.label = label;

        // Copy some attibutes from my parent (so they can be used to propagate updates later)
        this.color = participant.color;
        this.visible = participant.visible;
    }

    _make_unique_id(id) {
        if (id === null || id === undefined) {
            id = this.id;
        }
        return `${this.participant.unique_id}_marker_${id}`;
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
        if (attr == 'id') throw new Error('You cannot update ID!');

        // Save updated attribute
        this[attr] = value;
        this.emit('update');
    }

    remove() {
        // Nothing for me to do...

        this.emit('remove');
    }

    /**************************************\
    *             SERIALISATION            *
    \**************************************/

    serialise() {
        return {
            id: this.id,
            type: this.type,
            position: this.position,
            label: this.label
        };
    }

    deserialise(input) {
        // Update my attributes
        this._set_id(input.id);
        this.update('type', input.type);
        this.update('position', input.position);
        this.update('label', input.label);
    }
}

Emitter(Marker.prototype);
