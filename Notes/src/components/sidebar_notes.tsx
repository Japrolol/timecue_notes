import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ContextMenu from "./contextMenu.tsx";
import Notes from "./notes.tsx";
import axios from "axios";

type Note = {
    id: string;
    title: string;
    date_updated?: Date;
};

interface PassedData {
    notebook_id: string;
}

const SidebarNotes = ({ notebook_id }: PassedData) => {
    const [activeNote, setActiveNote] = useState<string | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const fetchNotes = () => {
        if (notebook_id) {
            axios.get(`${import.meta.env.VITE_API_URL}/retrieve_notes`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: {
                    notebook_id: notebook_id
                },
                withCredentials: true
            })
            .then(response => {
                setNotes(response.data.data);
            })
            .catch(error => {
                setNotes([]);
                console.error('Error fetching notes:', error);
            });
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [notebook_id]);

    const handleAddNote = () => {
        const newNote = { id: uuidv4(), title: 'New Note', notebook_id, date_updated: new Date() };

        axios.post(`${import.meta.env.VITE_API_URL}/create_note`, newNote, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                console.log("Note created");
                setNotes([...notes, newNote]);
                setTimeout(() => {
                    inputRefs.current[newNote.id]?.focus();
                    setActiveNote(newNote.id);
                }, 0);
            }
        }).catch(error => {
            console.error(error);
            return;
        });
    };

    const handleDeleteNote = (id: string) => {
        axios.post(`${import.meta.env.VITE_API_URL}/delete_note`, { id }, { withCredentials: true }).then(response => {
            if (response.status === 200) {
                console.log("Note deleted");
                setNotes(notes.filter(note => note.id !== id));
                setActiveNote(null);
            }
        }).catch(error => {
            console.error(error);
            return;
        });
    };

    const handleNoteClick = (id: string | null) => {
        setActiveNote(id);
    };

    const handleRightClick = (event: React.MouseEvent, id: string) => {
        event.preventDefault();
        setActiveNote(id);
        setContextMenu({ x: event.clientX - 300, y: event.clientY - 40, visible: true });
    };

    const handleCloseContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const contextMenuOptions = [
        { label: 'Delete', onClick: () => handleDeleteNote(activeNote!) },
        { label: 'Cancel', onClick: handleCloseContextMenu },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="sidebar_notes">
            <div className="controls">
                <button onClick={handleAddNote}><i className="bx bx-plus"></i>New note</button>
                <input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="notebook-grid">
                {filteredNotes.map((note) => (
                    <div
                        key={note.id}
                        onClick={() => handleNoteClick(note.id)}
                        onContextMenu={(event) => handleRightClick(event, note.id)}
                        className={`grid-item notebook ${activeNote === note.id ? "active" : ""}`}>
                        <form onSubmit={handleSubmit} className="main_body">
                            <input
                                className="main_text"
                                type="text"
                                value={note.title}
                                readOnly={true}
                            />
                        </form>
                    </div>
                ))}
            </div>

            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenuOptions}
                    onClose={handleCloseContextMenu}
                    title="Delete note?"
                />
            )}
            {activeNote && <Notes id={activeNote} onSave={fetchNotes} />}
        </div>
    );
};

export default SidebarNotes;