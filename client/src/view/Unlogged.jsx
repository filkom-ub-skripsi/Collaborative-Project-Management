import React from 'react'
import { Switch, Route } from 'react-router-dom'

import Error from './Error'
import Home from './unlogged/Home'

export default class Unlogged extends React.Component {
  render() {
    return (
      <Switch>
        <Route path="/" exact component = { Home }></Route>
        <Route path="*" component = { Error }></Route>
      </Switch>
    )
  }
}