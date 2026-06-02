import {
db,
collection,
getDocs
} from "./firebase.js";

async function loadDashboard(){

    const snapshot = await getDocs(
        collection(db,"students")
    );

    document.getElementById("studentCount").innerText =
        snapshot.size;
}

loadDashboard();