import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Navbar from '../component/content/loggedin/Navbar'
import Error from './Error'
import Home from './loggedin/Home'
import Client from './loggedin/Client'
import Projects from './loggedin/Projects'
import DetailProject from './loggedin/DetailProject'
import Users from './loggedin/Users'
import Profile from './loggedin/Profile'

export default class Loggedin extends React.Component {
  render() {
    return (
      <div>
        <Navbar webservice={this.props.webservice}/>
        <Switch>
          <Route path="/" exact component = { Home }></Route>
          <Route
            path="/projects"
            render = {(props)=> <Projects {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="/detail-project/:id"
            render = {(props)=> <DetailProject  {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="/clients"
            render = {(props)=> <Client {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="/users"
            render = {(props)=> <Users {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="/profile"
            render = {(props)=> <Profile {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="*"
            component = { Error }
          />
        </Switch>
      </div>
    )
  }
}