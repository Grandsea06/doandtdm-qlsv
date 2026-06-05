import {
    db,
    auth,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}
from "./firebase.js";

import {
    getUserRole,
    cacheRole,
    canEdit
} from "./rolecheck.js";

let classes = [];
let editingId = null;

const table =
document.getElementById("classTable");

const modal =
document.getElementById("classModal");
const addButton = document.querySelector(".toolbar button");
async function loadDepartments(){

    const snapshot =
    await getDocs(collection(db,"departments"));

    const select =
    document.getElementById("departmentName");

    select.innerHTML =
    `<option value="">-- Chọn khoa --</option>`;

    snapshot.forEach(doc => {

        const data = doc.data();

        select.innerHTML += `
        <option value="${data.departmentCode}">
            ${data.departmentName}
        </option>
        `;
    });
}

const updateRoleUI = () => {
    if (!canEdit() && addButton) {
        addButton.style.display = "none";
    }
};

const initPage = async () => {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "index.html";
            return;
        }

        const role = await getUserRole(user);
        cacheRole(role);
        updateRoleUI();

        await loadDepartments();
        await loadClasses();
    });
};

/* =========================
   MỞ MODAL THÊM
========================= */

window.openModal = () => {
    if (!canEdit()) {
        alert("Chỉ admin mới có thể thêm hoặc sửa lớp học.");
        return;
    }

    editingId = null;

    document.getElementById("modalTitle").innerText =
    "Thêm lớp học";

    document.getElementById("classCode").value = "";
    document.getElementById("className").value = "";
    document.getElementById("departmentName").value = "";

    modal.style.display = "block";
};

/* =========================
   ĐÓNG MODAL
========================= */

window.closeModal = () => {

    modal.style.display = "none";
};

/* =========================
   THÊM / SỬA LỚP
========================= */

window.saveClass = async () => {

    const classCode =
    document.getElementById("classCode").value;

    const className =
    document.getElementById("className").value;

    const departmentName =
    document.getElementById("departmentName").value;

    if(
        !classCode ||
        !className ||
        !departmentName
    ){
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const data = {
        classCode,
        className,
        departmentName
    };

    try{

        if(editingId){

            await updateDoc(
                doc(db,"classes",editingId),
                data
            );

        }else{

            await addDoc(
                collection(db,"classes"),
                data
            );
        }

        closeModal();

        loadClasses();

    }catch(error){

        console.error(error);

        alert("Lỗi khi lưu lớp học");
    }
};

/* =========================
   LOAD DỮ LIỆU
========================= */

async function loadClasses(){

    try{

        const classSnapshot =
        await getDocs(
            collection(db,"classes")
        );

        const studentSnapshot =
        await getDocs(
            collection(db,"students")
        );

        classes = [];

        classSnapshot.forEach(item=>{

            const classData =
            item.data();

            const totalStudents =
            studentSnapshot.docs.filter(student=>{

                return (
                    student.data().className ===
                    classData.classCode
                );

            }).length;

            classes.push({

                id:item.id,

                ...classData,

                totalStudents

            });

        });

        renderTable(classes);

    }catch(error){

        console.error(error);
    }
}

/* =========================
   HIỂN THỊ BẢNG
========================= */

function renderTable(data){

    table.innerHTML = "";

    if(data.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="5">
                Chưa có lớp học nào
            </td>
        </tr>
        `;

        return;
    }

    data.forEach(item=>{

        table.innerHTML += `

        <tr>

            <td>${item.classCode || ""}</td>

            <td>${item.className || ""}</td>

            <td>${item.departmentName || ""}</td>

            <td>${item.totalStudents}</td>

            <td>
                ${canEdit() ? `
                <button onclick="editClass('${item.id}')">Sửa</button>
                <button onclick="deleteClass('${item.id}')">Xóa</button>
                ` : `<span>Chỉ xem</span>`}
            </td>

        </tr>

        `;

    });
}

/* =========================
   SỬA LỚP
========================= */

window.editClass = (id)=>{
    if (!canEdit()) {
        alert("Chỉ admin mới có thể sửa lớp học.");
        return;
    }

    const item =
    classes.find(x=>x.id===id);

    if(!item) return;

    editingId = id;

    document.getElementById("modalTitle").innerText =
    "Sửa lớp học";

    document.getElementById("classCode").value =
    item.classCode;

    document.getElementById("className").value =
    item.className;

    document.getElementById("departmentName").value =
    item.departmentName;

    modal.style.display = "block";
};

/* =========================
   XÓA LỚP
========================= */

window.deleteClass = async(id)=>{
    if (!canEdit()) {
        alert("Chỉ admin mới có thể xóa lớp học.");
        return;
    }

    const confirmDelete =
    confirm("Bạn có chắc muốn xóa lớp này?");

    if(!confirmDelete) return;

    try{

        await deleteDoc(
            doc(db,"classes",id)
        );

        loadClasses();

    }catch(error){

        console.error(error);

        alert("Không thể xóa lớp");
    }
};

/* =========================
   TÌM KIẾM
========================= */

document
.getElementById("searchInput")
.addEventListener("input",(e)=>{

    const keyword =
    e.target.value.toLowerCase();

    const result =
    classes.filter(item=>

        item.classCode
        ?.toLowerCase()
        .includes(keyword)

        ||

        item.className
        ?.toLowerCase()
        .includes(keyword)

        ||

        item.departmentName
        ?.toLowerCase()
        .includes(keyword)

    );

    renderTable(result);

});

/* =========================
   KHỞI CHẠY
========================= */

initPage();