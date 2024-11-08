import axios from 'axios';


const handleLogin = async (email: string, password: string): Promise<void> => {
   await axios.post(import.meta.env.VITE_API_URL + `/login`, { email, password }, { withCredentials: true }).then (response => {
        if (response.status === 200) {
            window.location.href = "/";
        }
    }).catch(error => {
        console.error(error);
    });
};

const handleLogout = async (): Promise<void> => {
    await axios.post(import.meta.env.VITE_API_URL + `/logout`, {}, { withCredentials: true });
};

const CheckAuthenticated = async (): Promise<boolean> => {
    try {
        const response = await axios.get(import.meta.env.VITE_API_URL + `/protected`, { withCredentials: true });
        return response.status === 200;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401){
            return false;
        }
        return false;
    }
};

export default { handleLogin, handleLogout, CheckAuthenticated };