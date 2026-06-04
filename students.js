import {
    db,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from "./firebase.js";

let students = [];
let editingId = null;

const table = document.getElementById("studentTable");
const modal = document.getElementById("studentModal");

async function loadClasses() {

    const select =
    document.getElementById("className");

    select.innerHTML =
    `<option value="">-- Chọn lớp --</option>`;

    const snapshot =
    await getDocs(
        collection(db, "classes")
    );

    snapshot.forEach(item => {

        const cls = item.data();

        select.innerHTML += `
            <option value="${cls.classCode}">
                ${cls.classCode}
            </option>
        `;
    });
};
async function loadDepartments(){

    const snapshot =
    await getDocs(
        collection(db,"departments")
    );

    const departmentSelect =
    document.getElementById("department");

    departmentSelect.innerHTML =
    `<option value="">
        -- Chọn khoa --
    </option>`;

    snapshot.forEach(item=>{

        const data = item.data();

        departmentSelect.innerHTML += `

        <option
            value="${data.departmentName}">
            ${data.departmentName}
        </option>

        `;

    });

};
async function loadClassesByDepartment(departmentName){

    const snapshot =
    await getDocs(
        collection(db,"classes")
    );

    const classSelect =
    document.getElementById("className");

    classSelect.innerHTML =
    `<option value="">
        -- Chọn lớp --
    </option>`;

    snapshot.forEach(item=>{

        const data = item.data();

        if(
            data.departmentName ===
            departmentName
        ){

            classSelect.innerHTML += `

            <option
                value="${data.classCode}">
                ${data.className}
            </option>

            `;

        }

    });

}

window.openAddModal = async () => {

    editingId = null;

    await loadClasses();

    document.getElementById("modalTitle").innerText =
    "Thêm sinh viên";

    document.getElementById("studentId").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("dateOfBirth").value = "";
    document.getElementById("gender").value = "Nam";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
    document.getElementById("department").value = "";
    document.getElementById("className").value = "";
    document.getElementById("academicYear").value = "";
    document.getElementById("status").value = "Đang học";

    modal.style.display = "block";
};

window.closeModal = () => {
    modal.style.display = "none";
};

window.saveStudent = async () => {

    const studentData = {

        studentId:
        document.getElementById("studentId").value,

        fullName:
        document.getElementById("fullName").value,

        dateOfBirth:
        document.getElementById("dateOfBirth").value,

        gender:
        document.getElementById("gender").value,

        email:
        document.getElementById("email").value,

        phone:
        document.getElementById("phone").value,

        address:
        document.getElementById("address").value,

        department:
        document.getElementById("department").value,

        className:
        document.getElementById("className").value,

        academicYear:
        document.getElementById("academicYear").value,

        status:
        document.getElementById("status").value
    };

    if (editingId) {

        await updateDoc(
            doc(db, "students", editingId),
            studentData
        );

    } else {

        await addDoc(
            collection(db, "students"),
            studentData
        );

        const classSnapshot =
        await getDocs(
            collection(db, "classes")
        );

        for (const item of classSnapshot.docs) {

            const cls = item.data();

            if (
                cls.classCode ===
                studentData.className
            ) {

                await updateDoc(
                    doc(db, "classes", item.id),
                    {
                        totalStudents:
                        (cls.totalStudents || 0) + 1
                    }
                );

                break;
            }
        }
    }

    closeModal();

    loadStudents();
};

async function loadStudents() {

    const snapshot =
    await getDocs(
        collection(db, "students")
    );

    students = [];

    snapshot.forEach(item => {

        students.push({
            id: item.id,
            ...item.data()
        });

    });

    renderTable(students);
}

function renderTable(data) {

    table.innerHTML = "";

    data.forEach(student => {

        table.innerHTML += `
        <tr>

            <td>${student.studentId || ""}</td>

            <td>${student.fullName || ""}</td>

            <td>${student.gender || ""}</td>

            <td>${student.department || ""}</td>

            <td>${student.className || ""}</td>

            <td>${student.status || ""}</td>

            <td>${student.email || ""}</td>

            <td>

                <button
                onclick="editStudent('${student.id}')">
                    Sửa
                </button>

                <button
                onclick="removeStudent('${student.id}')">
                    Xóa
                </button>

            </td>

        </tr>
        `;
    });
}

window.editStudent = async (id) => {

    await loadClasses();

    const student =
    students.find(
        x => x.id === id
    );

    editingId = id;

    document.getElementById("modalTitle").innerText =
    "Sửa sinh viên";

    document.getElementById("studentId").value =
    student.studentId || "";

    document.getElementById("fullName").value =
    student.fullName || "";

    document.getElementById("dateOfBirth").value =
    student.dateOfBirth || "";

    document.getElementById("gender").value =
    student.gender || "Nam";

    document.getElementById("email").value =
    student.email || "";

    document.getElementById("phone").value =
    student.phone || "";

    document.getElementById("address").value =
    student.address || "";

    document.getElementById("department").value =
    student.department || "";

    document.getElementById("className").value =
    student.className || "";

    document.getElementById("academicYear").value =
    student.academicYear || "";

    document.getElementById("status").value =
    student.status || "Đang học";

    modal.style.display = "block";
};

window.removeStudent = async (id) => {

    if (!confirm("Bạn có chắc muốn xóa?"))
        return;

    const student =
    students.find(
        x => x.id === id
    );

    const classSnapshot =
    await getDocs(
        collection(db, "classes")
    );

    for (const item of classSnapshot.docs) {

        const cls = item.data();

        if (
            cls.classCode ===
            student.className
        ) {

            await updateDoc(
                doc(db, "classes", item.id),
                {
                    totalStudents:
                    Math.max(
                        (cls.totalStudents || 0) - 1,
                        0
                    )
                }
            );

            break;
        }
    }

    await deleteDoc(
        doc(db, "students", id)
    );

    loadStudents();
};

document
.getElementById("searchInput")
.addEventListener("input", (e) => {

    const keyword =
    e.target.value.toLowerCase();

    const result =
    students.filter(student =>

        (student.fullName || "")
        .toLowerCase()
        .includes(keyword)

        ||

        (student.studentId || "")
        .toLowerCase()
        .includes(keyword)

        ||

        (student.className || "")
        .toLowerCase()
        .includes(keyword)
    );

    renderTable(result);
});
document
.getElementById("department")
.addEventListener(
    "change",
    (e)=>{

        loadClassesByDepartment(
            e.target.value
        );

    }
);
loadDepartments();
loadStudents();