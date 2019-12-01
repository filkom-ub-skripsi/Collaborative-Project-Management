import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Error from './Error'
import Home from './unlogged/Home'

export default class Unlogged extends React.Component {
  render() {
    return (
      <Switch>
        <Route
          path="/"
          exact
          render = {(props)=> <Home {...props} webservice={this.props.webservice}/>}
        />
        <Route
          path="*"
          component = { Error }
        />
      </Switch>
    )
  }
}