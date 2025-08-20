import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  return <div className="p-4">Table Tennis Tracker</div>;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
