import React from 'react'
import { Navbar } from 'react-bootstrap'

export default class LayoutAppbar extends React.Component {
  render() {
    return (
      <div style={{paddingBottom:35}}>
        <Navbar sticky="top" bg="light" variant="light" className="justify-content-between">
          {this.props.left}
          {this.props.right}
        </Navbar> 
      </div>
      
    )
  }
}