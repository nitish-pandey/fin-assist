import axios from "axios";
interface LoginProps {
    email: string;
    password: string;
}

const URL = "http://localhost:3000/api";

export const login = async ({
    email,
    password,
}: LoginProps) => {
    const response = await axios.post(`${URL}/login`, {
        email,
        password,
    });
    return response.data;
}
