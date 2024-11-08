import React from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    options: { label: string, onClick: () => void }[];
    onClose: () => void;
    title: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose, title }) => {
    return (
        <div
            className="context-menu"
            style={{ top: y, left: x, position: 'absolute' }}
            onClick={onClose}
        >
            <span>{title}</span>
            {options.map((option, index) => (
                <div key={index} className="context-menu-item" onClick={option.onClick}>
                    {option.label}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;