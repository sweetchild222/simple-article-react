// components/ToastContainer.jsx
import React, { useState, useCallback } from 'react';
import Toast from './Toast';
import './ToastContainer.css'; // We will create this file next

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    
    setToasts((prevToasts) => [...prevToasts, { id, message, type}]);
  }, []);

  const removeToast = useCallback((id) => {
    
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast function globally or via Context API for easy access
  // A simple way for a demo is to attach it to window for easy calling in App.jsx
  // In a real app, use Context or a custom hook.
  window.showToast = addToast; 

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}          
          type={toast.type}          
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;