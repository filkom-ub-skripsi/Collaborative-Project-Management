import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Navbar from '../component/content/loggedin/Navbar'
import Error from './Error'
import Home from './loggedin/Home'
import Client from './loggedin/Client'
import Projects from './loggedin/Projects'
import DetailProject from './loggedin/DetailProject'
import Document from './loggedin/Document'
import GanttChart from './loggedin/GanttChart'
import ScrumBoard from './loggedin/ScrumBoard'
import Issue from './loggedin/Issue'
import Users from './loggedin/Users'
import Profile from './loggedin/Profile'

export default class Loggedin extends React.Component {
  render() {
    return (
      <div>
        <Navbar webservice={this.props.webservice}/>
        <Switch>
          <Route
            exact
            path="/"
            render = {(props)=> <Home {...props} webservice={this.props.webservice}/>}
          />
          <Route
            path="/projects"
            render = {(props) =>
              <Projects {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
              />
            }
          />
          <Route
            path="/detail-project/:id"
            render = {(props) =>
              <DetailProject {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
                hashMD5={this.props.hashMD5}
              />
            }
          />
          <Route
            path="/document/:id"
            render = {(props) =>
              <Document {...props}
                webservice={this.props.webservice}
              />
            }
          />
          <Route
            path="/gantt-chart/:id"
            render = {(props) =>
              <GanttChart {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
              />
            }
          />
          <Route
            path="/scrum-board/:id"
            render = {(props) =>
              <ScrumBoard {...props}
                webservice={this.props.webservice}
              />
            }
          />
          <Route
            path="/issue/:id"
            render = {(props) =>
              <Issue  {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
              />
            }
          />
          <Route
            path="/clients"
            render = {(props) =>
              <Client {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
              />
            }
          />
          <Route
            path="/users"
            render = {(props) =>
              <Users {...props}
                webservice={this.props.webservice}
                objectId={this.props.objectId}
                hashMD5={this.props.hashMD5}
              />
            }
          />
          <Route
            path="/profile"
            render = {(props) =>
              <Profile {...props}
                webservice={this.props.webservice}
                hashMD5={this.props.hashMD5}
              />
            }
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