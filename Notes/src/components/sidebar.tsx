import React, {useState, useRef, useEffect} from 'react';
import ContextMenu from './contextMenu';
import { v4 as uuidv4 } from 'uuid';
import SidebarNotes from "./sidebar_notes.tsx";
import axios from "axios";

interface Notebook {
    id: string;
    title: string;
}

const Sidebar = () => {
    const [activeNotebook, setActiveNotebook] = useState<string | null>(null);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        axios.get(import.meta.env.VITE_API_URL + `/retrieve_notebook`, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                setNotebooks(response.data.data);
            }
        }).catch(error => {
            console.error(error);
        });
    }, []);
    const handleAddNotebook = () => {
        const newNotebook = { id: uuidv4(), title: 'New Notebook' };

        axios.post(import.meta.env.VITE_API_URL + `/create_notebook`, newNotebook, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                console.log("Notebook created");
                setNotebooks([...notebooks, newNotebook]);
                setTimeout(() => {
                    inputRefs.current[newNotebook.id]?.focus();
                    setActiveNotebook(newNotebook.id);
                }, 0);
            }
        }).catch(error => {
            console.error(error);
            return;
        });
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (document.activeElement === inputRefs.current[activeNotebook!]) {
            inputRefs.current[activeNotebook!]?.blur();
            return; // Prevent double execution
        }

        let title = inputRefs.current[activeNotebook!]?.value.trim();

        // Check if the title is empty and update accordingly
        if (title === "" || title == null) {
            title = "New Notebook";
        }

        axios.post(import.meta.env.VITE_API_URL + `/update_notebook`, { id: activeNotebook, title }, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                console.log("Notebook updated");
                setNotebooks(notebooks.map(notebook =>
                    notebook.id === activeNotebook ? { ...notebook, title } : notebook
                ));
                // Blur the input field
                inputRefs.current[activeNotebook!]?.blur();
                }
        }).catch(error => {
            console.error(error);
            return;
        });
    };

    const handleDeleteNotebook = (id: string) => {
        axios.post(import.meta.env.VITE_API_URL + `/delete_notebook`, { id }, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                console.log("Notebook deleted");
                setNotebooks(notebooks.filter(notebook => notebook.id !== id));
                setActiveNotebook(null);
            }
        }).catch(error => {
            console.error(error);
            return;
        });
    };

    const handleNotebookClick = (id: string | null) => {
        setActiveNotebook(id);
    };

    const handleInputDoubleClick = (id: string) => {
        inputRefs.current[id]?.focus();
    };

    const preventFocus = (event: React.MouseEvent<HTMLInputElement>) => {
        event.preventDefault();
    };

    const handleRightClick = (event: React.MouseEvent, id: string) => {
        event.preventDefault();
        setActiveNotebook(id);
        setContextMenu({ x: event.clientX, y: event.clientY, visible: true });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleBlur = (id: string) => {
        if (activeNotebook === id) {
            handleSubmit(new Event('submit', {bubbles: true, cancelable: true}) as unknown as React.FormEvent);
        }
    }

    const contextMenuOptions = [
        { label: 'Delete', onClick: () => handleDeleteNotebook(activeNotebook!) },
        { label: 'Cancel', onClick: handleCloseContextMenu },
    ];

    return (
        <div>
            <nav className="sidebar">
                <div className="notebooks" onClick={() => handleNotebookClick(null)}>
                    <i className='bx bx-notepad'></i>
                    <h3>NOTEBOOKS</h3>
                    <i className='bx bx-plus add' onClick={handleAddNotebook}></i>
                </div>

                <div className="notebook-grid">
                    {notebooks.map((notebook) => (
                        <div
                            key={notebook.id}
                            onClick={() => handleNotebookClick(notebook.id)}
                            onContextMenu={(event) => handleRightClick(event, notebook.id)}
                            className={`grid-item notebook ${activeNotebook === notebook.id ? "active" : ""}`}>
                            <form onSubmit={handleSubmit} className="main_body">
                                <input
                                    className="main_text"
                                    type="text"
                                    value={notebook.title}
                                    ref={el => inputRefs.current[notebook.id] = el}
                                    onMouseDown={preventFocus}
                                    onDoubleClick={() => handleInputDoubleClick(notebook.id)}
                                    onBlur={() => handleBlur(notebook.id)}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        setNotebooks(notebooks.map(n => n.id === notebook.id ? {
                                            ...n,
                                            title: newTitle
                                        } : n));
                                    }}
                                />
                            </form>

                        </div>
                    ))}
                </div>
            </nav>
            {/* <nav className="sidebar-placeholder"></nav>
            <nav className="sidebar-placeholder-notes"></nav>
            */}
            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenuOptions}
                    onClose={handleCloseContextMenu}
                    title="Delete notebook?"
                />
            )}
            {activeNotebook && <SidebarNotes notebook_id={activeNotebook}/>}
        </div>
    );
};

export default Sidebar;