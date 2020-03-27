document.querySelector('body').onload = main;
const courseList = document.getElementById("courseList");

function main () {
    document.getElementById('courseCode').focus();
    document.getElementById('connect-form').onsubmit = (event) => {
        console.log('submitting')
        event.preventDefault();
        connect();
        return false;
    };
}

async function getCourses () {
    console.log(data)
    const res = await fetch('https://juniper.beer/student/courses', {
        method: 'GET'
    })
    console.log(res);
    if (res.status === 200) {
        const resData = await res.json();
        const courses = resData.courses;
        for (const course of courses) {
            const {courseUUID, prefix, courseNum, sectionNum} = course;
            const li = document.createElement('li');
            li.textContent = `${prefix}${courseNum}-${sectionNum} | ${courseUUID}`;
            courseList.appendChild(li);
        }
    }
}