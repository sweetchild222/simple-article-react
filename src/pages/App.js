// App.jsx
import React from 'react';
import ToastContainer from './ToastContainer';

function App() {
  const handleSuccessClick = () => {
    window.showToast('Action successful!', 'success');
  };

  const handleErrorClick = () => {
    window.showToast('An error occurred.', 'error');
  };

  return (
    <div className="App">
      <h1>Custom Toasts</h1>
      <button onClick={handleSuccessClick}>Show Success Toast</button>
      <button onClick={handleErrorClick}>Show Error Toast</button>
      <ToastContainer />
    </div>
  );
}

export default App;