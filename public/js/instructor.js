const body = document.querySelector('body')
window.onload = main;
const courseList = document.getElementById("courseList");
const flashes = document.querySelector(".flashes");
let courseTemplate;
let courses;

function main () {
    document.querySelector("#addProctor").onclick = openGenProctorForm;
    setTimeout(() => {
        document.querySelector("#addProctor").click();
        document.getElementById("genProctorCode").click();
    }, 250);
    document.querySelector("#exitProctorForm").onclick = exitProctorForm;
    document.querySelector("#addProctorForm").onsubmit = genProctorCode;
    courseTemplate = document.querySelector("#courseTemplate");
    getCourses();
}

async function getCourses () {
    const res = await fetch('https://juniper.beer/instructor/courses', {
        method: 'GET'
    })
    console.log(res);
    if (res.status === 200) {
        const resData = await res.json();
        courses = resData.courses;
        console.log(resData)
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
        createFlash("You do not have permission to view this course!", "error");
    }
}

function openGenProctorForm () {
    document.querySelector(".mainView").classList.add("blur");
    document.querySelector("#addProctorModal").classList.remove("hidden");
    const courseList = document.querySelector("#courseList-proctorCodes"); 
    courses.forEach( course => {
        const {prefix, courseNum, sectionNum, courseName, courseUUID} = course;
        const option = document.createElement('option');
        option.textContent = `${prefix}${courseNum}-${sectionNum} ${courseName}`;
        option.setAttribute("courseUUID", courseUUID);
        console.log(option);
        courseList.appendChild(option);
    });
}

function exitProctorForm () {
    document.querySelector(".mainView").classList.remove("blur");
    document.querySelector("#addProctorModal").classList.add("hidden");
}

async function genProctorCode (event) {
    event.preventDefault();
    const select = document.querySelector("#courseList-proctorCodes");
    const courseUUID = select.options[select.selectedIndex].getAttribute("courseUUID");
    const courseName = select.options[select.selectedIndex].textContent;
    const res = await fetch("https://juniper.beer/course/proctorCode", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({courseUUID})
    });
    if (res.status === 200) {
        const data = await res.json();
        console.log(data);
        createFlash(`The proctor code for ${courseName} is: <span class="mono">${data.proctorCode} <i class="far fa-copy" onmouseout="resetToolTip();" onclick="copy('${data.proctorCode}');"><span class="tooltip hidden">Copy</span></i></span>`, "success");

    } else if (res.status === 409) {
        const data = await res.json();
        console.log(data);
        createFlash(`A proctor code for ${courseName} already exists. It is: <span class="mono">${data.proctorCode} <i class="far fa-copy" onmouseout="resetToolTip();" onclick="copy('${data.proctorCode}');"><span class="tooltip hidden">Copy</span></i></span>`, "info");
    } else {
        createFlash(`Failed to create proctor code for ${courseName}!`, "fail");
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

async function copy (text) {
    await navigator.clipboard.writeText(text);
    document.querySelector("span.tooltip").textContent = "Copied!";
}

function resetToolTip () {
    document.querySelector("span.tooltip").textContent = "Copy";
}