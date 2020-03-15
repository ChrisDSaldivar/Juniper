document.querySelector('body').onload = main;

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
        firstName: document.getElementById('firstName').value.trim().toLowerCase(),
        lastName: document.getElementById('lastName').value.trim().toLowerCase(),
        courseNumber: document.getElementById('courseNumber').value,
    }
    console.log(data)
    const res = await fetch('https://juniper.beer/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    console.log(res);
    if (res.status === 200) {
        const data = await res.json();
        window.location = data.route;
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
}