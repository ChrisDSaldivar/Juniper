const body = document.querySelector('body')
window.onload = main;
const courseList = document.getElementById("courseList");
const flashes = document.querySelector(".flashes");
let courseTemplate;

function main () {
    courseTemplate = document.querySelector("#courseTemplate");
    getCourses();
    getProctoredCourses();
    document.getElementById('courseCode').focus();
    document.getElementById('addProctor').onclick = openProctorForm;
    document.querySelector("#exitProctorForm").onclick = exitProctorForm;
    document.querySelector("#proctorForm").onsubmit = submitProctorCode;

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
            const {lastName, firstName, prefix, courseNum, sectionNum, courseUUID, courseName} = course;
            const newCourse = courseTemplate.content.cloneNode(true);
            newCourse.querySelector(".courseNumber").textContent = `${prefix}${courseNum}-${sectionNum}`;
            newCourse.querySelector(".instructor").textContent = `${lastName}, ${firstName}`;
            newCourse.querySelector(".courseName").textContent = `${courseName}`;
            newCourse.querySelector("button").setAttribute("courseUUID", courseUUID);
            newCourse.querySelector("button").onclick = joinCourse;
            courseList.appendChild(newCourse);
        }
    }
}

async function joinCourse (event) {
    const courseUUID = this.getAttribute("courseUUID");
    console.log(courseUUID);
    console.log("Joining")
    const res = await fetch(`https://juniper.beer/student/course/${courseUUID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: "follow"
    });
    console.log(res)
    if (res.status === 200) {
        window.location.href = res.url;
    } else if (res.status === 403) {
        createFlash("You are not in this course's roster", "error");
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

function openProctorForm () {
    document.querySelector(".mainView").classList.add("blur");
    document.querySelector("#proctorModal").classList.remove("hidden");
}

function exitProctorForm (target) {
    document.querySelector(".mainView").classList.remove("blur");
    document.querySelector("#proctorModal").classList.add("hidden");
}

async function submitProctorCode () {
    event.preventDefault();
    const proctorCode = document.querySelector("#proctorCode").value;
    const res = await fetch('https://juniper.beer/course/proctor', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({proctorCode})
    });
    const {courseName} = await res.json();
    console.log(courseName);
    if (res.status === 200) {
        createFlash(`Succesfully added you to ${courseName}.`, "success");
    } else if (res.status === 409) {
        createFlash(`You are already a proctor for ${courseName}`, "error");
    } else {
        createFlash("Unable to add you to proctor list", "error");
    }
    return false;
}

async function getProctoredCourses () {
    const courseList = await document.getElementById("proctorCourseList");
    const res = await fetch('https://juniper.beer/proctor/courses', {
        method: 'GET'
    })
    console.log(res);
    if (res.status === 200) {
        const resData = await res.json();
        const courses = resData.courses;
        console.log(courses)
        courseList.innerHTML = "";
        for (const course of courses) {
            const {lastName, firstName, prefix, courseNum, sectionNum, courseUUID, courseName} = course;
            const newCourse = courseTemplate.content.cloneNode(true);
            newCourse.querySelector(".courseNumber").textContent = `${prefix}${courseNum}-${sectionNum}`;
            newCourse.querySelector(".instructor").textContent = `${lastName}, ${firstName}`;
            newCourse.querySelector(".courseName").textContent = `${courseName}`;
            newCourse.querySelector("button").setAttribute("courseUUID", courseUUID);
            newCourse.querySelector("button").onclick = joinCourseProctor;
            courseList.appendChild(newCourse);
        }
    }
}

async function joinCourseProctor (event) {
    const courseUUID = this.getAttribute("courseUUID");
    console.log(courseUUID);
    console.log("Joining")
    const res = await fetch(`https://juniper.beer/proctor/screens/${courseUUID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: "follow"
    });
    console.log(res)
    if (res.status === 200) {
        window.location.href = res.url;
    } else if (res.status === 403) {
        createFlash("You are not a proctor for this course!", "error");
    }
}