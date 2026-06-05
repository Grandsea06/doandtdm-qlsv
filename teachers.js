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

let teachers = [];
let editingId = null;

const table = document.getElementById("teacherTable");
const modal = document.getElementById("teacherModal");
const addButton = document.querySelector(".toolbar button");

async function loadDepartments(){

    const snapshot =
    await getDocs(
        collection(
            db,
            "departments"
        )
    );

    const select =
    document.getElementById(
        "departmentName"
    );

    select.innerHTML =
    `<option value="">
        Chọn khoa
     </option>`;

    snapshot.forEach(item=>{

        const dep =
        item.data();

        select.innerHTML += `
        <option
        value="${dep.departmentCode}">
        ${dep.departmentName}
        </option>
        `;
    });

}

const updateRoleUI = () => {
    if (!canEdit()) {
        if (addButton) {
            addButton.style.display = "none";
        }
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
        await loadTeachers();
    });
};

/* =====================
   MỞ MODAL
===================== */

window.openModal = () => {
    if (!canEdit()) {
        alert("Chỉ admin mới có thể thêm hoặc sửa giảng viên.");
        return;
    }

    editingId = null;

    document.getElementById("modalTitle").innerText =
    "Thêm giảng viên";

    document.getElementById("teacherCode").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("departmentName").value = "";

    modal.style.display = "block";
};

/* =====================
   ĐÓNG MODAL
===================== */

window.closeModal = () => {

    modal.style.display = "none";
};

/* =====================
   THÊM / SỬA
===================== */

window.saveTeacher = async () => {
    if (!canEdit()) {
        alert("Chỉ admin mới có thể lưu thay đổi.");
        return;
    }

    const teacherCode =
    document.getElementById("teacherCode").value;

    const fullName =
    document.getElementById("fullName").value;

    const email =
    document.getElementById("email").value;

    const phone =
    document.getElementById("phone").value;

    const departmentName =
    document.getElementById("departmentName").value;

    if(
        !teacherCode ||
        !fullName ||
        !email
    ){
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    const data = {
        teacherCode,
        fullName,
        email,
        phone,
        departmentName
    };

    try{

        if(editingId){

            await updateDoc(
                doc(
                    db,
                    "teachers",
                    editingId
                ),
                data
            );

        }else{

            await addDoc(
                collection(
                    db,
                    "teachers"
                ),
                data
            );
        }

        closeModal();

        loadTeachers();

    }catch(error){

        console.error(error);

        alert("Lỗi lưu dữ liệu");
    }
};

/* =====================
   LOAD DỮ LIỆU
===================== */

async function loadTeachers(){

    try{

        const snapshot =
        await getDocs(
            collection(
                db,
                "teachers"
            )
        );

        teachers = [];

        snapshot.forEach(item=>{

            teachers.push({

                id:item.id,

                ...item.data()

            });

        });

        renderTable(teachers);

    }catch(error){

        console.error(error);
    }
}

/* =====================
   HIỂN THỊ BẢNG
===================== */

function renderTable(data){

    table.innerHTML = "";

    if(data.length === 0){

        table.innerHTML = `
        <tr>
            <td colspan="6">
                Chưa có giảng viên nào
            </td>
        </tr>
        `;

        return;
    }

    const editable = canEdit();

    data.forEach(item=>{

        table.innerHTML += `

        <tr>

            <td>${item.teacherCode || ""}</td>

            <td>${item.fullName || ""}</td>

            <td>${item.email || ""}</td>

            <td>${item.phone || ""}</td>

            <td>${item.departmentName || ""}</td>

            <td>
                ${editable ? `
                <button onclick="editTeacher('${item.id}')">Sửa</button>
                <button onclick="deleteTeacher('${item.id}')">Xóa</button>
                ` : `<span>Chỉ xem</span>`}
            </td>

        </tr>

        `;

    });

}

/* =====================
   SỬA
===================== */

window.editTeacher = (id)=>{
    if (!canEdit()) {
        alert("Chỉ admin mới có thể sửa giảng viên.");
        return;
    }

    const item =
    teachers.find(
        x=>x.id===id
    );

    if(!item) return;

    editingId = id;

    document.getElementById("modalTitle").innerText =
    "Sửa giảng viên";

    document.getElementById("teacherCode").value =
    item.teacherCode;

    document.getElementById("fullName").value =
    item.fullName;

    document.getElementById("email").value =
    item.email;

    document.getElementById("phone").value =
    item.phone;

    document.getElementById("departmentName").value =
    item.departmentName;

    modal.style.display = "block";
};

/* =====================
   XÓA
===================== */

window.deleteTeacher = async(id)=>{
    if (!canEdit()) {
        alert("Chỉ admin mới có thể xóa giảng viên.");
        return;
    }

    if(
        !confirm(
            "Bạn có chắc muốn xóa?"
        )
    ) return;

    try{

        await deleteDoc(
            doc(
                db,
                "teachers",
                id
            )
        );

        loadTeachers();

    }catch(error){

        console.error(error);

        alert("Không thể xóa");
    }
};

/* =====================
   TÌM KIẾM
===================== */

document
.getElementById("searchInput")
.addEventListener(
    "input",
    (e)=>{

        const keyword =
        e.target.value.toLowerCase();

        const result =
        teachers.filter(item=>

            item.teacherCode
            ?.toLowerCase()
            .includes(keyword)

            ||

            item.fullName
            ?.toLowerCase()
            .includes(keyword)

            ||

            item.departmentName
            ?.toLowerCase()
            .includes(keyword)

        );

        renderTable(result);
    }
);

/* =====================
   KHỞI CHẠY
===================== */

initPage();