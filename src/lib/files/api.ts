import {apiFetch} from "../api/apiClient";




export const getFiles = async () => {
    return apiFetch(`/api/files`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch(`/api/files`, {
        method: "POST",
        body: formData,
    });
};