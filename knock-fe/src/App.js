import React from 'react';
import {useState, useEffect, useRef} from 'react'

import Main from './Main'
import './App.css';



function App() {
  const [username, SetUsername] = useState('')
  const [user, SetUser] = useState('')
  
 

  return (
    <div className='container'>

    { user ? (
      
      <Main user={user}/>

      
      ) : (

      <div className='login'>

        <input 
        className='input'
        type="text" 
        placeholder='username' 
        onChange={(e) => SetUsername(e.target.value)}
        />
        <button className='btn-login' onClick={() => SetUser(username)}>Login</button>

      </div>
      )}
    </div>
  );
}

export default App;





