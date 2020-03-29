document.querySelector('body').onload = main;
const flashes = document.querySelector(".flashes");

function main () {
    document.getElementById('prefix').focus();
    document.getElementById('createCourse-form').onsubmit = (event) => {
        console.log('submitting')
        event.preventDefault();
        process();
        return false;
    };
}

async function process () {
    const data = {
        prefix: document.getElementById('prefix').value.trim(),
        courseNum: document.getElementById('courseNum').value.trim(),
        sectionNum: document.getElementById('sectionNum').value.trim(),
        courseName: document.getElementById('courseName').value.trim(),
    }
    console.log(data)
    const res = await fetch('https://juniper.beer/instructor/courses', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    if (res.status === 200) {
        const resData = await res.json();
        console.log(resData);
        createFlash(`Added ${data.courseName}! The code is <span class="mono">${resData.courseCode}</span>`, "success");
    } else {
        createFlash(`Couldn't add course.`, "error");
    }
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