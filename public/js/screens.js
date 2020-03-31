'use strict';

const ws = new WebSocket('wss://juniper.beer/socket/screens');

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log(msg);
    if (msg.studentInfo) {
        console.log(`Student Info: ${JSON.stringify(msg.studentInfo,null,2)}`);
        renderStudents(msg.studentInfo);
    } else if (msg.questions) {
        console.log(`Questions: ${JSON.stringify(msg.questions,null,2)}`);
        displayQuestions(msg.questions);
    }
};

// Just puts red border around students for now
function displayQuestions (questions) {
    for (const uuid in questions) {
        console.log(uuid);
        const student = document.getElementById(uuid);
        if (!student) {
            continue;
        }
        student.classList.add("needs-help")
    }
}

// document.querySelector('body').onload = main;
// let students = [];
// let idMap = {};

// async function main(){
// }

function renderStudents (studentInfo) {
    const noStudents = document.getElementById("no-students");
    if (Object.keys(studentInfo).length === 0) {
        return noStudents.classList.remove("hidden");
    } 
    noStudents.classList.add("hidden");
    let container = document.getElementById("container");
    container.innerHTML = "";
    for (const studentUUID in studentInfo) {
        const {firstName, lastName} = studentInfo[studentUUID];
        const name = `${firstName} ${lastName}`;

        let studentHeader = document.createElement('h2');
        studentHeader.align = "center";
        studentHeader.textContent = `${name}: ${studentUUID}`;
        studentHeader.id = `${studentUUID}-name`;

        let studentImg = document.createElement('img');
        studentImg.src ="https://via.placeholder.com/100";
        studentImg.alt = name;
        studentImg.id = `${studentUUID}-img`;

        let connectedStudent = document.createElement("div");
        connectedStudent.className = "card";
        connectedStudent.id = studentUUID;
        connectedStudent.onclick = function oneOnOne(event){
            window.location = `https://juniper.beer/view?id=${studentUUID}&name=${name}`;
            
        }
        connectedStudent.appendChild(studentImg);
        connectedStudent.appendChild(studentHeader);

        container.appendChild(connectedStudent);
    };
}
