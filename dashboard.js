import {
db,
collection,
getDocs
}
from "./firebase.js";

async function loadDashboard(){

    const studentsSnapshot =
    await getDocs(
        collection(db,"students")
    );

    document.getElementById(
        "totalStudents"
    ).innerText =
    studentsSnapshot.size;

    const classesSnapshot =
    await getDocs(
        collection(db,"classes")
    );

    document.getElementById(
        "totalClasses"
    ).innerText =
    classesSnapshot.size;

    const departmentsSnapshot =
    await getDocs(
        collection(db,"departments")
    );

    document.getElementById(
        "totalDepartments"
    ).innerText =
    departmentsSnapshot.size;
}

loadDashboard();