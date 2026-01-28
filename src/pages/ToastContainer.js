import React, { useState, useCallback, createElement } from 'react';
import Toast from './Toast';
import './ToastContainer.css'; // We will create this file next

export default function(){

  const [toasts, setToasts] = useState([]);
  
  let lastTime;

  const addToast = useCallback((message, type = 'info') => {

    const key = Date.now()

    lastTime = key

    const onClose = () => removeToast()
    
    const props = {key, message, type, onClose}

    setToasts((toasts) => [...toasts, createElement(Toast, props)]);

  }, []);


  const removeToast = useCallback(() => {

    const remain = 3000 - (Date.now() - lastTime)

    if(remain <= 100)
      setToasts([])

  }, []);


  window.showToast = addToast;

  return (
    <div className="toast-container">
      {toasts}
    </div>
  );
};

