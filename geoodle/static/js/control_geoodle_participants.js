
class GeoodleParticipantControl {
    constructor(controlDiv, geoodleControl) {
        this.controlDiv = $(controlDiv);
        this.geoodleControl = geoodleControl;

        this.init_controls();
        this.init_control_listeners();
        this.init_listeners();
    }

    init_controls() {
        this.controlDiv.html(`
            <div
                class="container"
                style="
                    background-color: white;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 3px;
                    box-shadow: rgba(0, 0, 0, 0.298039) 0px 2px 6px;
                    cursor: pointer;
                    text-align: center;
                ">
                Participants:
                <div class="participant_list">
                </div>
                <button
                    class="add_participant">
                    Add Participant
                </button>
                <button
                    class="remove_all_participants">
                    Clear Participants
                </button>
            </div>`);

        this.controls = {
            participant_list: this.controlDiv.find('.participant_list'),
            remove_all_participants: this.controlDiv.find('.remove_all_participants'),
            add_participant: this.controlDiv.find('.add_participant')
        }
    }

    get_participant_html(id, name, color) {
        return `
            <div
                participant_id="${id}">
                <input
                    type="radio"
                    name="selected_participant">
                <input
                    class="participant_color"
                    title="Set participant colour"
                    type="color"
                    value="${color}"
                    style="
                        border: none;
                        border-radius: 5px;
                        width: 20px;
                    "/>
                <input
                    class="participant_name"
                    title="Enter participants name"
                    type="text"
                    value="${name}"
                    />
                <button
                    class="remove_participant">
                    X
                </button>
            </div>`;
    }

    init_control_listeners() {
        // Send events to GeoodleControl

        this.controls.add_participant.click(function() {
            this.geoodleControl.add_participant(null, 'A participant', '#ff0000');
        }.bind(this));

        this.controlDiv.on('change', '[name="selected_participant"]', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.geoodleControl.set_selected_participant(id);
        }.bind(this))

        this.controlDiv.on('change', '.participant_color', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.geoodleControl.update_participant(id, 'color', target.val());
        }.bind(this))

        this.controlDiv.on('change', '.participant_name', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.geoodleControl.update_participant(id, 'name', target.val());
        }.bind(this))

        this.controlDiv.on('click', '.remove_participant', function(e) {
            let target = $(e.target);
            let id = target.parent().attr('participant_id');
            this.geoodleControl.remove_participant(id);
        }.bind(this))

        this.controlDiv.on('click', '.remove_all_participants', function(e) {
            this.geoodleControl.remove_all_participants();
        }.bind(this))
    }

    init_listeners() {
        // Update UI state from GeoodleControl events

        this.geoodleControl.on('add_participant', function(participant) {
            this.controls.participant_list.append(
                this.get_participant_html(
                    participant.id,
                    participant.name,
                    participant.color
                )
            );
        }.bind(this));

        this.geoodleControl.on('update_participant', function(participant) {
            let participant_element = this.controlDiv.find(`[participant_id=${participant.id}]`);
            participant_element.find('.participant_color').val(participant.color);
            participant_element.find('.participant_name').val(participant.name);
        }.bind(this));

        this.geoodleControl.on('remove_participant', function(participant_id) {
            this.controlDiv.find(`[participant_id=${participant_id}]`).remove();
        }.bind(this));

        this.geoodleControl.on('set_selected_participant', function(participant_id) {
            let selected_participant = this.controlDiv.find(`[participant_id=${participant_id}] input[type="radio"]`);
            selected_participant.prop('checked', true);
        }.bind(this));
    }
}
