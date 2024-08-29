// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import VisitsDisplay from './Components/VisitsDisplay';
import LoginForm from './Components/Login';
import { useAuth } from './Contexts/AuthContext';

function App() {
  const { currentUser } = useAuth();

  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/"
          element={currentUser ? <VisitsDisplay /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
