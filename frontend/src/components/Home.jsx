import React from 'react'
import { useUser } from '../UserContext';


const Home = () => {
    const { user } = useUser();

  return (
    <div>
      <h1>This is Home</h1>
      <h3>Welcome {user ? user.email : "Loading...."}</h3>
      <a href="/dashboard">Dashboard</a>
    </div>
  )
}

export default Home
