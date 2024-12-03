import axios from "axios";
import { UserType } from "../data/types";
interface LoginProps {
    email: string;
    password: string;
}

// const URL = "https://22c55236-38b1-45ea-93f4-a0bd1aa0de31.mock.pstmn.io/api";
const URL = "http://localhost:5000/api"

export const login = async ({
    email,
    password,
}: LoginProps) => {
    const response = await axios.post(`${URL}/users/login`, {
        email,
        password,
    });
    return response.data as { token: string, user: UserType };
}

interface UserInfoProps {
    token: string;
    userId: string;
}

export const getUserInfo = async ({ token, userId }: UserInfoProps) => {
    const response = await axios.get(`${URL}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data as UserType;
};


interface CreateOrganizationProps {
    userId: string;
    token: string;
    name: string;
}

export const createOrganization = async ({
    userId,
    token,
    name,
}: CreateOrganizationProps) => {
    const response = await axios.post(`${URL}/users/${userId}/orgs`, {
        name
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};