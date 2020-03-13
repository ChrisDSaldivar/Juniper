'use strict';

const ws = new WebSocket('ws://localhost:9090');

document.querySelector('body').onload = main;
let students = [];

async function main(){
    const res = await fetch('http://localhost:9090/students', {
        method: "GET",
    });
    if (res.status !== 200) {
        return alert('Failed to fetch students');
    }
    const data = await res.json();
    students = data.students;
    renderStudents();
}

function renderStudents () {
    students.forEach((student) => {
        let container = document.getElementById("container");

        let studentHeader = document.createElement('h2');
        studentHeader.align = "center";
        studentHeader.textContent = student;
        studentHeader.id = student;

        let studentImg = document.createElement('img');
        studentImg.src ="https://via.placeholder.com/100";
        studentImg.alt = student;
        studentImg.id = student;

        let connectedStudent = document.createElement("div");
        connectedStudent.className = "card";
        connectedStudent.id = student;
        connectedStudent.onclick = function oneOnOne(event){
            let params = event.target.id;
            window.location = `http://localhost:9090/student?firstname=${params}`;
            
        }
        connectedStudent.appendChild(studentImg);
        connectedStudent.appendChild(studentHeader);

        container.appendChild(connectedStudent);
    });
}
