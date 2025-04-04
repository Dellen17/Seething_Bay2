import React from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa'; // For the close icon
import '../styles/Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') // Ensure you have a div with id="modal-root" in index.html
  );
};

export default Modal;