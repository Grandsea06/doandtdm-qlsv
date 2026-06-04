import {
db,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc
}
from "./firebase.js";

let departments = [];
let editingId = null;

const table =
document.getElementById("departmentTable");

const modal =
document.getElementById("departmentModal");

window.openModal = () => {

    editingId = null;

    document.getElementById(
        "departmentCode"
    ).value = "";

    document.getElementById(
        "departmentName"
    ).value = "";

    document.getElementById(
        "description"
    ).value = "";

    modal.style.display = "block";
};

window.closeModal = () => {

    modal.style.display = "none";
};

window.saveDepartment = async () => {

    const data = {

        departmentCode:
        document.getElementById(
            "departmentCode"
        ).value,

        departmentName:
        document.getElementById(
            "departmentName"
        ).value,

        description:
        document.getElementById(
            "description"
        ).value
    };

    if(editingId){

        await updateDoc(
            doc(
                db,
                "departments",
                editingId
            ),
            data
        );

    }else{

        await addDoc(
            collection(
                db,
                "departments"
            ),
            data
        );
    }

    closeModal();

    loadDepartments();
};

async function loadDepartments(){

    const snapshot =
    await getDocs(
        collection(
            db,
            "departments"
        )
    );

    departments = [];

    snapshot.forEach(item=>{

        departments.push({

            id:item.id,
            ...item.data()
        });
    });

    renderTable(departments);
}

function renderTable(data){

    table.innerHTML = "";

    data.forEach(dep=>{

        table.innerHTML += `
        <tr>

            <td>${dep.departmentCode}</td>

            <td>${dep.departmentName}</td>

            <td>${dep.description}</td>

            <td>

                <button
                onclick="editDepartment('${dep.id}')">
                Sửa
                </button>

                <button
                onclick="deleteDepartment('${dep.id}')">
                Xóa
                </button>

            </td>

        </tr>
        `;
    });
}

window.editDepartment = (id)=>{

    const dep =
    departments.find(
        d=>d.id===id
    );

    editingId = id;

    document.getElementById(
        "departmentCode"
    ).value =
    dep.departmentCode;

    document.getElementById(
        "departmentName"
    ).value =
    dep.departmentName;

    document.getElementById(
        "description"
    ).value =
    dep.description;

    modal.style.display =
    "block";
};

window.deleteDepartment =
async(id)=>{

    if(!confirm("Xóa khoa?"))
        return;

    await deleteDoc(
        doc(
            db,
            "departments",
            id
        )
    );

    loadDepartments();
};

document
.getElementById(
    "searchInput"
)
.addEventListener(
    "input",
    (e)=>{

        const keyword =
        e.target.value
        .toLowerCase();

        const result =
        departments.filter(dep=>

            dep.departmentName
            .toLowerCase()
            .includes(keyword)

            ||

            dep.departmentCode
            .toLowerCase()
            .includes(keyword)
        );

        renderTable(result);
    }
);

loadDepartments();