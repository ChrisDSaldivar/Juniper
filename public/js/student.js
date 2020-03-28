const body = document.querySelector('body')
body.onload = main;
const courseList = document.getElementById("courseList");
const flashes = document.querySelector(".flashes");

function main () {
    getCourses();
    document.getElementById('courseCode').focus();

    document.getElementById('addCourse-form').onsubmit = (event) => {
        event.preventDefault();
        addCourse();
        return false;
    };
}

async function addCourse () {
    const courseCode = document.getElementById('courseCode').value;
    console.log(courseCode);
    const res = await fetch('https://juniper.beer/student/courses', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({courseCode})
    })
    console.log(res);
    if (res.status === 200) {
        const resData = await res.json();
        resData;
        console.log(resData)
        createFlash("You've succesfully added the course!", "success");
        getCourses();
    } else {
        createFlash("Unable to add course", "error");
    }
}

async function getCourses () {
    const res = await fetch('https://juniper.beer/student/courses', {
        method: 'GET'
    })
    console.log(res);
    if (res.status === 200) {
        const resData = await res.json();
        const courses = resData.courses;
        console.log(courses)
        courseList.innerHTML = "";
        for (const course of courses) {
            const {lastName, firstName, prefix, courseNum, sectionNum} = course;
            const li = document.createElement('li');
            li.textContent = `${prefix}${courseNum}-${sectionNum} | ${lastName}, ${firstName}`;
            courseList.appendChild(li);
        }
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