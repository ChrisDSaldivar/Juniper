'use strict';

const ws = new WebSocket('wss://juniper.beer');

document.querySelector('body').onload = main;
let students = [];
let idMap = {};

async function main(){
    const res = await fetch('https://juniper.beer/proctor/courses/connectedStudents', {
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
        const [ name, id ] = student.split(':');
        idMap[name] = id;
        studentHeader.textContent = name+' : '+id;
        studentHeader.id = name;

        let studentImg = document.createElement('img');
        studentImg.src ="https://via.placeholder.com/100";
        studentImg.alt = name;
        studentImg.id = name;

        let connectedStudent = document.createElement("div");
        connectedStudent.className = "card";
        connectedStudent.id = name;
        connectedStudent.onclick = function oneOnOne(event){
            const name = event.target.id;
            const id = idMap[name];
            window.location = `https://juniper.beer/view?id=${id}&name=${name}`;
            
        }
        connectedStudent.appendChild(studentImg);
        connectedStudent.appendChild(studentHeader);

        container.appendChild(connectedStudent);
    });
}
