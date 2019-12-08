import React from 'react'
import { Link } from 'react-router-dom'
import { Form, Nav, Badge, Dropdown, Container, Row, Col, ListGroup } from 'react-bootstrap'
import { Settings, Bell } from 'react-feather'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Check, X } from 'react-feather'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import LayoutAppbar from '../../layout/Appbar'
import ImageLogo from '../../image/logo.png'

//class
export default class ContentNavbar extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      data:[],name:null,division:null
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
    this.refresh()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      employee(_id:"`+localStorage.getItem('user')+`") {
        name,
        division {
          name
        }
        collaborator {
          _id,
          project {
            _id,
            name,
            employee {
              email
            },
          },
          status
        }
      }
    }`}).then(result => {
      var data = []
      result.data.employee.collaborator.forEach(function(item){
        if (item.status === '0') { data.push(item) }
      })
      var division = null
      if (result.data.employee.division.length === 0) { division = 'Leader' }
      else { division = result.data.employee.division[0]['name'] }
      this.setState({
        data:data,
        name:result.data.employee.name,
        division:division
      })
    })
  }

  //refresh
  refresh(){
    setInterval(() => this.push(), 60000)
  }
  
  //accept
  accept(id,project,detail){
    Swal({
      title:"Accept",
      text:"You will be a collaborator on this project",
      icon:"info",buttons:true,dangerMode:true,
    })
    .then((willAccept) => {
      if (willAccept) {
        this.fetch({query:`mutation {
          collaborator_status(_id:"`+id+`",status:"1"){_id}
        }`})
        var data = this.state.data.filter(function(item){ return item._id !== id })
        this.setState({data:data})
        var activity_id = RDS.generate({length:32,charset:'alphabetic'})
        this.fetch({query:`
          mutation {
            activity_add(
              _id:"`+activity_id+`",project:"`+project+`",
              code:"I2",detail:"`+detail+`",
              date:"`+new Date()+`"
            ){_id}
          }`
        })
        NotificationManager.info('You accept the invitation')
      }
    })
  }

  //decline
  decline(id,project,detail){
    Swal({
      title:"Decline",
      text:"You will decline this invitation",
      icon:"warning",buttons:true,dangerMode:true,
    })
    .then((willDecline) => {
      if (willDecline) {
        this.fetch({query:`mutation {
          collaborator_delete(_id:"`+id+`"){_id}
        }`})
        var data = this.state.data.filter(function(item){ return item._id !== id })
        this.setState({data:data})
        var activity_id = RDS.generate({length:32,charset:'alphabetic'})
        this.fetch({query:`
          mutation {
            activity_add(
              _id:"`+activity_id+`",project:"`+project+`",
              code:"I3",detail:"`+detail+`",
              date:"`+new Date()+`"
            ){_id}
          }`
        })
        NotificationManager.warning('You decline the invitation')
      }
    })
  }

  //logout
  logout(){
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

  //left
  left(){
    return (
      <Form inline>
        <img src={ImageLogo} alt="Logo" width="150px"/>
        <Nav style={{paddingLeft:5}} className="animated fast fadeIn">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/clients" className="nav-link">Client</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
        </Nav>
      </Form>
    )
  }
  
  //right
  right(){
    return (
      <Form inline className="animated fast fadeIn">
        <Dropdown alignRight>
          <Dropdown.Toggle variant="light" id="notifications">
            <Bell/>
            <Badge variant="warning">{this.state.data.length > 0 && this.state.data.length}</Badge>
          </Dropdown.Toggle>
          <Dropdown.Menu style={{width:450}}>
            <Container>
              <div style={{fontWeight:700,paddingBottom:8}}>Invitation</div>
            </Container>
            <ListGroup variant="flush">
            {this.state.data.length === 0 &&
              <ListGroup.Item>
                <div style={{fontWeight:500}}>Empty</div>
                <small>There is no invitation</small>
              </ListGroup.Item>
            }
            {this.state.data.map((item,index) => {
              var func_id = item._id
              var func_project = item.project[0]['_id']
              var func_detail = this.state.name+'_'+this.state.division
              return (
                <ListGroup.Item key={index} className="list-group-notification">
                  <Row><Col lg={9}>
                    <div className="clipped" style={{fontWeight:500,width:350}}>{item.project[0]['name']}</div>
                    <small style={{color:'grey'}}>{item.project[0]['employee'][0]['email']}</small>
                  </Col><Col lg={3} className="text-right" style={{paddingTop:7}}>
                    <X size={20} style={{color:'#BD2031'}} onClick={()=>this.decline(func_id,func_project,func_detail)}/>
                    <span style={{paddingLeft:10}}/>
                    <Check size={20} style={{color:'#0B6623'}} onClick={()=>this.accept(func_id,func_project,func_detail)}/>
                  </Col></Row>
                </ListGroup.Item>
              )
            })}
            </ListGroup>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown alignRight>
          <Dropdown.Toggle variant="light" id="settings">
            <Settings/>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/users">Users</Dropdown.Item>
            <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
            <Dropdown.Divider/>
            <Dropdown.Item onClick={()=>this.logout()}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Form>
    )
  }

  //render
  render() {
    return (
      <LayoutAppbar
        left={this.left()}
        right={this.right()}
      />
    )
  }

}