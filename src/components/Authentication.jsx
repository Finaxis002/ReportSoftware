import React from 'react'
import { useLocation, Navigate } from 'react-router-dom';

const Authentication = ({ children }) => {
    const userData = localStorage.getItem("userData");
    const location = useLocation()

    if (typeof window !== "undefined" && userData) {
        return children
    }

    return (
        <Navigate to="/login" state={{ from: location }} replace />
    )
}

export default Authentication