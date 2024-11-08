import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import auth from "./auth.tsx";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const doLogout = async () => {
            await auth.handleLogout();
            navigate('/login');
        };
        doLogout();
    }, [navigate]);

    return null;
};
export default Logout;