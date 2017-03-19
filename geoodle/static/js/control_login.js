class LoginControl {
    constructor(controlDiv) {
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
                    font-size: large;
                    padding: 5px;
                ">
                <a href="/user_home/">
                    Create a persistent Geoodle
                </a>
            </div>`;
    }
}
