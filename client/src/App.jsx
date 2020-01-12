import React from 'react'
import RDS from 'randomstring'
import MD5 from 'md5'
import { BrowserRouter, Route } from 'react-router-dom'
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css'

import Unlogged from './view/Unlogged'
import Loggedin from './view/Loggedin'

//global variable
const webservice = 'https://cpm-graphql.inhuaschool.com/graphql'

//global function
const objectId = () => { return RDS.generate({length:32,charset:'alphabetic'}) }
const hashMD5 = (value) => { return MD5(value) }

function App() {
  if (localStorage.getItem('user') === null) {
    return (
      <div>
        <BrowserRouter>
          <Route
            path="/"
            component = {() =>
              <Unlogged
                webservice={webservice}
                objectId={objectId}
                hashMD5={hashMD5}
              />
            }
          />
        </BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  } else {
    return (
      <div>
        <BrowserRouter>
          <Route
            path="/"
            component = {() =>
              <Loggedin
                webservice={webservice}
                objectId={objectId}
                hashMD5={hashMD5}
            />
          }/>
        </BrowserRouter>
        <NotificationContainer/>
      </div>
    )
  }
}

export default App;
