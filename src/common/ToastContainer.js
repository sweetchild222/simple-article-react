import React, { useState, useCallback, createElement } from 'react';
import Toast from './Toast';
import './ToastContainer.css';

export default function(){

  const [toasts, setToasts] = useState([]);

  let current_toasts = []

  const addToast = useCallback((message, type = 'info') => {

    const current = Date.now()

    const key = current +  Math.floor(Math.random() * 1000)
    
    const onClose = () => removeToast(key)
    
    const props = {key, message, type, onClose}

    current_toasts.push(key)

    setToasts((toasts) => [...toasts, createElement(Toast, props)]);

  }, []);


  const removeToast = useCallback((removedKey) => {
    
    current_toasts = current_toasts.filter((key) => removedKey != key)

    if(current_toasts.length == 0)
      setToasts([])

  }, []);


  window.showToast = addToast;
  
  return (
    <div id="toast-container">
      {toasts}
    </div>
  );
};

