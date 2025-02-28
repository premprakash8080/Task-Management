import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DashboardWrapper from './components/dashboard'
import About from './components/pages/About'
import Contact from './components/pages/Contact'
import Login from './components/Login'
import HomePage from './components/pages/HomePage'

const IndexPage = () => {

    return <div>Welcome to Scrum Master<br/><a href="/story/1">Homepage</a><br/><a href="/login">Login</a></div>
}
const NotFoundPage = () => {

    return <div><h2>Not Found</h2><br/><a href="/story/1">Homepage</a></div>
}
const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/story/:id" element={<DashboardWrapper />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<IndexPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}
export default AppRoutes