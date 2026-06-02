import {
auth,
signInWithEmailAndPassword,
signOut
}
from "./firebase.js";

window.login = async () => {

    console.log("Đã bấm đăng nhập");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Đăng nhập thành công");

        window.location.href = "dashboard.html";

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
};

window.logout = async ()=>{

await signOut(auth);

window.location.href =
"index.html";

};