import {useNavigate} from "react-router-dom";
import React, {useCallback, useEffect} from "react";
import Auth from "./auth.tsx";
import axios from "axios";


interface ProtectedProps {
    element: React.ReactElement;
}
const Protected: React.FC<ProtectedProps> = ({element}) => {
    const [authenticated, setAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const navigate = useNavigate();
    const checkAuth = useCallback(async () => {
        try {
            const authenticated = await Auth.CheckAuthenticated();
            setAuthenticated(authenticated);
            if (authenticated) {
                setLoading(false);
            } else {
                navigate('/login', {replace: true});
            }
        } catch (error) {
            setAuthenticated(false);
            console.error(error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate('/login', {replace: true});
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    if (!loading) {
        return authenticated ? element : null;
    }
}
export default Protected;