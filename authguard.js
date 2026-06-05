import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const auth = getAuth();

auth.onAuthStateChanged(user => {

    if (!user) {
        window.location.href = "login.html";
    }

});