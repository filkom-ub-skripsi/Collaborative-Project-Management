import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import Unlogged from './view/Unlogged'
import Loggedin from './view/Loggedin'

const webservice = 'https://skripsi-cpm-server.herokuapp.com/graphql'

function App() {
  if (localStorage.getItem('user') === null) {
    return (
      <div>
        <BrowserRouter>
          <Route path="/" component = {()=><Unlogged webservice={webservice}/>}></Route>
        </BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  } else {
    return (
      <div>
        <BrowserRouter>
          <Route path="/" component = {()=><Loggedin webservice={webservice}/>}></Route>
        </BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  }
}

export default App;
