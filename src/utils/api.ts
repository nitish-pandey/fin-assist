import axios from "axios";
import { RoleAccessSchema, UserSchema } from "../data/types";

export const BASE_URL = "http://localhost:5000";

// const URL = "https://22c55236-38b1-45ea-93f4-a0bd1aa0de31.mock.pstmn.io/api";
const URL = "http://localhost:5000/api"

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${URL}/users/login`, {
        email,
        password,
    });
    return response.data as { token: string, user: UserSchema };
}


export const getUserInfo = async (token: string, userId: string) => {
    const response = await axios.get(`${URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data as UserSchema;
};

export const createOrganization = async (userId: string, token: string, name: string) => {
    const response = await axios.post(`${URL}/users/${userId}/orgs`, {
        name
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getOrgUsers = async (orgId: string, token: string) => {
    const response = await axios.get(`${URL}/orgs/${orgId}/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data as RoleAccessSchema[];
}
