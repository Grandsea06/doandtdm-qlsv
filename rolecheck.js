import {
    db,
    doc,
    getDoc,
    setDoc
} from "./firebase.js";

const ROLE_STORAGE_KEY = "qlsv_user_role";

function defaultRole(user) {
    if (!user || !user.email) return "teacher";
    return user.email.toLowerCase() === "admin@gmail.com" ? "admin" : "teacher";
}

export async function getUserRole(user) {
    if (!user) return "teacher";

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
        const data = snapshot.data();
        return data?.role || defaultRole(user);
    }

    const role = defaultRole(user);

    try {
        await setDoc(userRef, { role }, { merge: true });
    } catch (error) {
        console.warn("Không thể lưu role người dùng", error);
    }

    return role;
}

export function cacheRole(role) {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function canEdit() {
    return localStorage.getItem(ROLE_STORAGE_KEY) === "admin";
}

export function clearRoleCache() {
    localStorage.removeItem(ROLE_STORAGE_KEY);
}
