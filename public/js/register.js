
const courseList = document.getElementById("courseList");
const flashes = document.querySelector(".flashes");

const urlParams = new URLSearchParams(window.location.search);
instructorCode = urlParams.get('instructorCode');

registerMain();

function registerMain () {
    document.querySelector("#register-btn").onclick = openRegisterForm;
    document.querySelector("#exitRegisterForm").onclick = exitRegisterForm;
    document.querySelector("#registerForm").onsubmit = register;
    if (instructorCode) {
        openRegisterForm();
    }
}


function openRegisterForm () {
    document.querySelector(".mainView").classList.add("blur");
    document.querySelector("#modal").classList.remove("hidden");
    document.getElementById("email-register").focus();
}

function exitRegisterForm () {
    document.querySelector(".mainView").classList.remove("blur");
    document.querySelector("#modal").classList.add("hidden");
}

async function register (event) {
    event.preventDefault();
    const email = document.getElementById("email-register").value;
    const password = document.getElementById("password-register").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const confirmPass = document.getElementById("confirmPassword-register").value;
    if (password !== confirmPass) {
        createFlash("Passwords do not match", "error");
    }
    const data = {email, password, firstName, lastName};
    console.log(data);
    const query = instructorCode ? `?instructorCode=${instructorCode}` : ``;
    const res = await fetch(`https://juniper.beer/register/${query}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.status === 200) {
        createFlash("Created account", "success");
        exitRegisterForm();
    } else {
        createFlash("Failed to create account", "error");
    }

    return false;
}

function createFlash (message, level) {
    let flash = `
    <div class="flash flash--${level}">
        <p class="flash__text">${message}</p>
        <button class="flash__remove" onClick="this.parentElement.remove()"> &times;</button>
    </div>
    `
    const div = document.createElement("div")
    div.innerHTML = flash.trim();
    flash = div.firstChild;
    flashes.appendChild(flash);
}