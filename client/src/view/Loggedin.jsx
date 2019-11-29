import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Navbar from '../component/content/loggedin/Navbar'
import Error from './Error'
import Home from './loggedin/Home'
import Client from './loggedin/Client'
import MyProjects from './loggedin/MyProjects'
import DetailProject from './loggedin/DetailProject'
import Users from './loggedin/Users'
import Profile from './loggedin/Profile'

export default class Loggedin extends React.Component {
  render() {
    return (
      <div>
        <Navbar/>
        <Switch>
          <Route path="/" exact component = { Home }></Route>
          <Route path="/my-projects" component = { MyProjects }></Route>
          <Route path="/detail-project/:id" component = { DetailProject }></Route>
          <Route path="/clients" component = { Client }></Route>
          <Route path="/users" component = { Users }></Route>
          <Route path="/profile" component = { Profile }></Route>
          <Route path="*" component = { Error }></Route>
        </Switch>
      </div>
    )
  }
}