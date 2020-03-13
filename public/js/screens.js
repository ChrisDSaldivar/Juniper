'use strict';

const ws = new WebSocket('ws://localhost:9090');

document.querySelector('body').onload = main;
var students = ['student 1','student 2','student 3', 'student 4', 'student 5'];

function main(){
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


