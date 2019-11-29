import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import Unlogged from './view/Unlogged'
import Loggedin from './view/Loggedin'

function App() {
  if (localStorage.getItem('user') === null) {
    return (
      <div>
        <BrowserRouter><Route path="/" component = { Unlogged }></Route></BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  } else {
    return (
      <div>
        <BrowserRouter><Route path="/" component = { Loggedin }></Route></BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  }
}

export default App;
