/**
 * The GeoodleControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */

/*
These icons are from the Material Design icon set. I have copied the SVG paths
here as there doesn't seem to be any better way to do everything needed:
 * Be able to use them as map marker icons
 * Be able to set their fill colour
 * Be able to use them in the controls
*/
const POINT_PATH = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';
const SUGGESTION_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';
const CLEAR_PATH = 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';

function GeoodleControl(controlDiv, map, center) {
    controlDiv.innerHTML = `
        <div
            class="container"
            style="
                background-color: white;
                border: 2px solid rgb(255, 255, 255);
                border-radius: 3px;
                box-shadow: rgba(0, 0, 0, 0.298039) 0px 2px 6px;
                cursor: pointer;
                text-align: center;
                font-size: 16px;
                line-height: 28px;
            ">
            <div
                class="add_point"
                title="Add/remove points"
                style="
                    background: lightgrey;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 10px;
                    padding: 5px;
                ">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                    <path d="${POINT_PATH}"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div
                class="add_suggestion"
                title=""
                style="
                    background: lightgrey;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 10px;
                    padding: 5px;
                ">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                    <path d="${SUGGESTION_PATH}"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
            <div
                class="remove_all"
                title="Remove all points & suggestions"
                style="
                    background: lightgrey;
                    border: 2px solid rgb(255, 255, 255);
                    border-radius: 10px;
                    padding: 5px;
                ">
                <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24">
                    <path d="${CLEAR_PATH}"/>
                    <path d="M0 0h24v24H0z" fill="none"/>
                </svg>
            </div>
        </div>`;

    // controlDiv.getElementsByClassName('recenter')[0].addEventListener('click', function() {
    //     map.setCenter(center);
    // });
}

// GeoodleControl.prototype.serialise = function() {
// }

// GeoodleControl.prototype.deserialise = function() {
// }
