
class GeoodleParticipantControl {
    constructor(controlDiv, geoodleControl) {
        this.init_controls(controlDiv);
    }

    init_controls(controlDivElement) {
        let controlDiv = $(controlDivElement);

        controlDiv.html(`
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
                <ul>
                    <li>
                        <input
                            class="participant_colour"
                            title="Set your colour"
                            type="color"
                            value="${this.color}"
                            style="
                                border: 2px solid rgb(255, 255, 255);
                                border-radius: 10px;
                                padding: 5px;
                                width: 24px;
                            "/>
                        <input
                            class="participant_name"
                            title="Enter participants name"
                            type="text"
                            value="Default participant"
                            />
                    </li>
                </ul>
                <button>Add Participant</button>
            </div>`);

        // this.controls = {
        //     add_point: controlDiv.find('.add_point'),
        //     add_suggestion: controlDiv.find('.add_suggestion'),
        //     remove_all: controlDiv.find('.remove_all'),
        //     move_to_center: controlDiv.find('.move_to_center'),
        //     show_hide_help: controlDiv.find('.show_hide_help'),
        //     choose_color: controlDiv.find('.choose_color')
        // }

        // this.control_labels = controlDiv.find('.control_label');
    }

}
