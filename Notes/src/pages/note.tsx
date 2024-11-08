import Sidebar from "../components/sidebar";
import useGetUserData from "../hooks/useGetUserData.tsx";
import {useNavigate} from "react-router-dom";

const Note = () => {
    const user = useGetUserData();
    const navigate = useNavigate();
    return (
        <div>
            <Sidebar />

            <div className="floating">
                <i className='bx bx-log-out logout' onClick={()=>navigate("/logout")}></i>
                {user?.username}
            </div>
        </div>

    );
};

export default Note;