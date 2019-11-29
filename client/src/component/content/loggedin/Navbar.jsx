import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Nav, Badge, Dropdown } from 'react-bootstrap'
import { Settings, Bell } from 'react-feather'
import { NotificationManager } from 'react-notifications'
import Swal from 'sweetalert'
import LayoutAppbar from '../../layout/Appbar'
import ImageLogo from '../../image/logo.png'

const left = () => {
  return (
    <Form inline>
      <img src={ImageLogo} alt="Logo" width="150px"/>
      <Nav style={{paddingLeft:5}} className="animated fast fadeIn">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/clients" className="nav-link">Client</Link>
        <Link to="/my-projects" className="nav-link">My Projects</Link>
      </Nav>
    </Form>
  )
}

const right = () => {
  return (
    <Form inline className="animated fast fadeIn">
      <Link to="/to-do" className="btn btn-light">
        <Bell/>
        <Badge variant="warning">0</Badge>
      </Link>
      <Dropdown alignRight>
        <Dropdown.Toggle variant="light" id="settings">
          <Settings/>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/users">Users</Dropdown.Item>
          <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
          <Dropdown.Divider/>
          <Dropdown.Item onClick={()=>logout()}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Form>
  )
}

const logout = () => {
  Swal({
    title:"Logout",
    text:"Your session will be ended",
    icon:"warning",
    closeOnClickOutside:false,
    buttons:true,
    dangerMode:true,
  })
  .then((willLogout) => {
    if (willLogout) {
      localStorage.clear()
      NotificationManager.success('Session ended successfully','',1000)
      setTimeout(()=>{window.location.href='/'},1500)
    }
  });
}

export default class ContentNavbar extends React.Component {
  render() {
    return (
      <LayoutAppbar
        left={left()}
        right={right()}
      />
    )
  }
}