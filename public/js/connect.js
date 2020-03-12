document.querySelector('body').onload = main;
console.log('yo')
function main () {
    document.getElementById('firstName').focus();
    document.getElementById('connect-form').onsubmit = (event) => {
        console.log('submitting')
        event.preventDefault();
        connect();
        return false;
    };
}

async function connect () {
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        courseNumber: document.getElementById('courseNumber').value,
    }
    console.log(data)
    const res = await fetch('http://localhost:9090/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    console.log(res);
    if (res.status === 200) {
        window.location = '/student';
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
}