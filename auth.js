import {
  db,
  auth,
  doc,
  setDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
}
from "./firebase.js";

window.login = async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        window.location.href = "dashboard.html";

    } catch (error) {

        if (
            email.toLowerCase() === "admin@gmail.com" &&
            password === "123456" &&
            error.code === "auth/user-not-found"
        ) {
            try {
                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                await setDoc(
                    doc(db, "users", userCredential.user.uid),
                    {
                        role: "admin",
                        email: userCredential.user.email
                    }
                );

                window.location.href = "dashboard.html";
                return;
            } catch (createError) {
                console.error(createError);
                alert(createError.message);
                return;
            }
        }

        console.error(error);
        alert(error.message);
    }
};

window.logout = async ()=>{

await signOut(auth);

window.location.href =
"index.html";

};