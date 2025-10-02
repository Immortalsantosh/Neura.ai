// import React from 'react'

import { Route } from "react-router-dom"
import { Routes } from "react-router-dom"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn" 
import Home from "./pages/Home"
import Customize from "./pages/customize"
import Customize2 from "./pages/customize2"

import { useContext } from "react"

import { Navigate } from "react-router-dom"
import { userDataContext } from "./Context/UserContext"

function App() {
  const {userData,setUserData}=useContext(userDataContext)
  return (
   <Routes>
     <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
     <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
       <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
   </Routes>
  )
}

export default App