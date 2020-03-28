document.querySelector('body').onload = main;

function main () {
    document.getElementById('email').focus();
    document.getElementById('connect-form').onsubmit = (event) => {
        console.log('submitting')
        event.preventDefault();
        connect();
        return false;
    };
}

async function connect () {
    const data = {
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value.trim().toLowerCase(),
    }
    console.log(data)
    const res = await fetch('https://juniper.beer/login', {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    console.log(res);
    if (res.redirected) {
        window.location.href = res.url;
    } else {
        alert(`${res.status}: ${res.statusText}`);
    }
}