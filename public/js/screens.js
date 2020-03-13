'use strict';

const ws = new WebSocket('ws://localhost:9090');

document.querySelector('body').onload = main;
let students = [];
var interval = null;

async function main(){
    resetDOM();
    const res = await fetch('http://localhost:9090/students', {
        method: "GET",
    });
    if (res.status !== 200) {
        return alert('Failed to fetch students');
    }
    const data = await res.json();
    students = data.students;
    renderStudents();
};

function renderStudents () {
    students.forEach((student) => {
        let container = document.getElementById("container");

        let studentHeader = document.createElement('h2');
        studentHeader.align = "center";
        studentHeader.style.fontSize = '1em';
        studentHeader.id = studentHeader.textContent = student;

        let studentImg = document.createElement('img');
        studentImg.src ="https://via.placeholder.com/100";
        studentImg.id = studentImg.alt = student;

        let connectedStudent = document.createElement("div");
        connectedStudent.className = "card";
        connectedStudent.id = student;
        connectedStudent.onclick = function oneOnOne(){ window.location = '/student'; }
        connectedStudent.appendChild(studentImg);
        connectedStudent.appendChild(studentHeader);

        container.appendChild(connectedStudent);
    });
    poolStudents();
};

function poolStudents(){
    if(interval !== null){
        clearInterval(interval);
    }
    interval = setInterval(() => { main() }, 10000);
}

function resetDOM(){
    let container = document.getElementById("container");
    while (container.firstChild){
        container.firstChild.remove();
    }
}