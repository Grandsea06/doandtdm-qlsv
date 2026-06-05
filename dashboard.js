import {
    db,
    auth,
    collection,
    getDocs
}
from "./firebase.js";

async function loadDashboard(){
    const studentsSnapshot =
        await getDocs(
            collection(db, "students")
        );

    const classesSnapshot =
        await getDocs(
            collection(db, "classes")
        );

    const departmentsSnapshot =
        await getDocs(
            collection(db, "departments")
        );

    document.getElementById(
        "totalStudents"
    ).innerText =
    studentsSnapshot.size;

    document.getElementById(
        "totalClasses"
    ).innerText =
    classesSnapshot.size;

    document.getElementById(
        "totalDepartments"
    ).innerText =
    departmentsSnapshot.size;

    const statusCounts = {
        "Đang học": 0,
        "Bảo lưu": 0,
        "Tốt nghiệp": 0,
        "Khác": 0
    };

    const classCounts = {};

    studentsSnapshot.forEach((item) => {
        const data = item.data();
        const status = data.status || "Khác";
        statusCounts[status] = (statusCounts[status] || 0) + 1;

        const className = data.className || "Chưa phân lớp";
        classCounts[className] =
            (classCounts[className] || 0) + 1;
    });

    renderStatusChart(
        Object.keys(statusCounts),
        Object.values(statusCounts)
    );

    const topClasses = Object.entries(classCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    renderClassChart(
        topClasses.map((item) => item[0]),
        topClasses.map((item) => item[1])
    );
}

function renderStatusChart(labels, data) {
    if (!window.Chart) return;

    new Chart(document.getElementById("statusChart"), {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    "#2563eb",
                    "#f59e0b",
                    "#10b981",
                    "#6b7280"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

function renderClassChart(labels, data) {
    if (!window.Chart) return;

    new Chart(document.getElementById("classChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Số sinh viên",
                data,
                backgroundColor: "#2563eb"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html";
    }
});

loadDashboard();