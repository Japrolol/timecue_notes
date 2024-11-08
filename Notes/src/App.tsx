import 'boxicons';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Note from './pages/note';
import './styles/style.css';
import Login from "./pages/login.tsx";
import Protected from "./auth/protected.tsx";
import Logout from "./auth/logout.tsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Protected element={<Note/>}/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/*" element={<Login/>}></Route>
        <Route path="/logout" element={<Logout/>}/>
      </Routes>
    </BrowserRouter>

    
  )
}

export default App
