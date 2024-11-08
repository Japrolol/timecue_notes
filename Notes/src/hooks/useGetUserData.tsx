import axios from 'axios';
import {useEffect, useState} from "react";
type UserData = {
    username: string;
    email: string;
}
const useGetUserData = () => {
    const [data, setData] = useState<UserData | null>(null);
    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_URL + '/user', {withCredentials: true});
                setData(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        getUserData();
    }, []);
    return data;
}
export default useGetUserData;