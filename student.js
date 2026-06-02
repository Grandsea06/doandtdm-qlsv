import {
db,
collection,
addDoc,
getDocs,
deleteDoc,
doc
}
from "./firebase.js";
console.log("students.js loaded");
const studentTable =

document.getElementById("studentTable");
console.log("studentTable =", studentTable);
window.addStudent = async () => {

    const studentId =
    document.getElementById("studentId").value;

    const fullName =
    document.getElementById("fullName").value;

    const className =
    document.getElementById("className").value;

    const email =
    document.getElementById("email").value;

    if(
        !studentId ||
        !fullName
    ){
        alert("Nhập đầy đủ thông tin");
        return;
    }

    await addDoc(
        collection(db,"students"),
        {
            studentId,
            fullName,
            className,
            email,
            createdAt:new Date()
        }
    );

    alert("Thêm thành công");

    document.getElementById("studentId").value="";
    document.getElementById("fullName").value="";
    document.getElementById("className").value="";
    document.getElementById("email").value="";

    loadStudents();
};

async function loadStudents(){

    const snapshot =
    await getDocs(
        collection(db,"students")
    );

    studentTable.innerHTML = "";

    snapshot.forEach((item)=>{

        const data = item.data();

        studentTable.innerHTML += `
        <tr>
            <td>${data.studentId || ""}</td>
            <td>${data.fullName || ""}</td>
            <td>${data.className || ""}</td>
            <td>${data.email || ""}</td>
            <td>
                <button
                onclick="removeStudent('${item.id}')">
                Xóa
                </button>
            </td>
        </tr>
        `;
    });
}

window.removeStudent = async (id)=>{

    if(!confirm("Xóa sinh viên?"))
        return;

    await deleteDoc(
        doc(db,"students",id)
    );

    loadStudents();
};

loadStudents();