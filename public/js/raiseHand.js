const raiseHandBtn = document.getElementById("raiseHand");
raiseHandBtn.onclick = raiseHand;;
const header = document.getElementById("info");

async function raiseHand () {
    const res = await fetch("https://juniper.beer/course/question", {
        method: "PUT",
    });
    if (res.status === 200) {
        header.textContent = "Waiting for available proctor";
        raiseHandBtn.disabled = true;
    } else {
        header.textContent = "Raise your hand if you have a question";
    }
}