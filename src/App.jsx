import React from "react"
import { Routes, Route } from "react-router-dom"

import FormPage from "./pages/FormPage"
import ProfilePage from "./pages/ProfilePage"
import SignupPage from "./pages/SignupPage"
import ProtectedRoute from "./ProtectedRoute"
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <FormPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
