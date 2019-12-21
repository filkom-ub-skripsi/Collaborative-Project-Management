import React from 'react'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { Tab, Card, Nav, Row, Col, Button, ListGroup, Modal, Form } from 'react-bootstrap'
import { RefreshCcw } from 'react-feather'
import { createApolloFetch } from 'apollo-fetch'

//notification
const success = 'Your changes have been successfully saved'

//refresh
const refresh_default = <RefreshCcw size={15} style={{marginBottom:2}}/>
const refresh_loading = 'Loading...'

//class
export default class ContentCollaborator extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
      header_button:true,header_refresh:refresh_loading,
      data_collaborator:[],data_pending:[],division:[],employee:[],
      invite_modal:false,invite_employee:[]
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    var data_collaborator = []
    var data_pending = []
    //collaborator
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        collaborator { _id,
          employee { _id, name, contact, email,
            division { _id, name }
          }
          status
        }
      }
    }`}).then(result => {
      this.props.update(result.data.project.collaborator)
      var temp = result.data.project.collaborator
      temp.forEach(function(item){
        if (item.status === '1') {
          data_collaborator.push({
            id:item.employee[0]['_id'],
            name:item.employee[0]['name'],
            email:item.employee[0]['email'],
            contact:item.employee[0]['contact'],
            division_id:item.employee[0]['division'][0]['_id'],
            division_name:item.employee[0]['division'][0]['name'],
            collaborator:item._id
          })
        } else {
          data_pending.push({
            id:item.employee[0]['_id'],
            name:item.employee[0]['name'],
            email:item.employee[0]['email'],
            contact:item.employee[0]['contact'],
            division_id:item.employee[0]['division'][0]['_id'],
            division_name:item.employee[0]['division'][0]['name'],
            collaborator:item._id
          })
        }
      })
      this.setState({
        data_collaborator:data_collaborator,
        data_pending:data_pending
      })
      //employee
      this.fetch({query:`{
        organization(_id:"`+localStorage.getItem('organization')+`") {
          division {
            _id, name,
            employee { _id, name, contact, email }
          },
        }
      }`}).then(result => {
        var all = data_collaborator.concat(data_pending)
        var division = []
        var employee = []
        result.data.organization.division.forEach(function(item_division){
          division.push({id:item_division._id,name:item_division.name})
          item_division.employee.forEach(function(item_employee){
            employee.push({
              id:item_employee._id,
              name:item_employee.name,
              email:item_employee.email,
              contact:item_employee.contact,
              division_id:item_division._id,
              division_name:item_division.name,
            })
          })
        })
        all.forEach(function(all){
          employee.forEach(function(item,index){
            if (all.id === item.id){ employee.splice(index,1) }
          })
        })
        this.setState({
          header_button:false,header_refresh:refresh_default,
          division:division,employee:employee,
        })
      })
    })
  }

  //reload
  reload(){
    this.setState({
      header_button:true,
      header_refresh:refresh_loading,
    })
    this.push()
  }

  //invite open
  invite_open(){
    var invite_employee = this.state.employee
    this.setState({
      invite_modal:true,
      invite_employee:invite_employee
    })
  }

  //invite option
  invite_option(id){
    if (id !== 'all') {
      var employee_filter = this.state.employee.filter(function(item){ return item.division_id === id })
      this.setState({invite_employee:employee_filter})
    } else {
      var employee_all = this.state.employee
      this.setState({invite_employee:employee_all})
    }
  }

  //invite handler
  invite_handler(){
    const field = document.getElementById('tambah_employee')
    const fback = document.getElementById('tambah_femployee')
    if (field.value === '') {
      field.className = 'form-control is-invalid'
      fback.innerHTML = 'this field cannot be empty'
    } else {
      field.className = 'form-control is-valid'
      fback.innerHTML = ''
      var id = this.props.objectId()
      var project = this.state.project_id 
      var employee = this.state.employee.filter(function(item){ return item.id !== field.value }) 
      var data_pending = this.state.employee.filter(function(item){ return item.id === field.value })
      data_pending.forEach(function(item){ item.collaborator = id })
      this.fetch({query:`mutation {
        collaborator_add(
          _id:"`+id+`",
          project:"`+project+`",
          employee:"`+data_pending[0]['id']+`",
          status:"0"
        ){_id}
      }`})
      this.setState({
        invite_modal:false,
        employee:employee,
        data_pending:[...this.state.data_pending,data_pending[0]],
      })
      var activity_id = this.props.objectId()
      var activity_code = 'I0'
      var activity_detail = data_pending[0]['name']+'_'+data_pending[0]['division_name']
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.props.activity(activity_code,activity_detail,activity_date)
      NotificationManager.success(success)
    }
  }

  //invite cancel
  invite_cancel(id_employee,id_collaborator){
    Swal({
      title:"Cancel Invitation",
      text:"Invitation on this employee will be deleted",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willCancel) => {
      if (willCancel) {
        this.fetch({query:`mutation {
          collaborator_delete(_id:"`+id_collaborator+`"){_id}
        }`})
        var data_pending = this.state.data_pending.filter(function(item){ return item.id !== id_employee })
        var employee = this.state.data_pending.filter(function(item){ return item.id === id_employee })
        this.setState({
          data_pending:data_pending,
          employee:[...this.state.employee,employee[0]]
        })
        var activity_id = this.props.objectId()
        var activity_code = 'I1'
        var activity_detail = employee[0]['name']+'_'+employee[0]['division_name']
        var activity_date = new Date()
        this.fetch({query:`
          mutation {
            activity_add(
              _id:"`+activity_id+`",
              project:"`+this.state.project_id+`",
              code:"`+activity_code+`",
              detail:"`+activity_detail+`",
              date:"`+activity_date+`"
            ){_id}
          }`
        })
        this.props.activity(activity_code,activity_detail,activity_date)
        NotificationManager.success(success)
      }
    })
  }

  //invite kick
  invite_kick(id_employee,id_collaborator){
    Swal({
      title:"Kick Collaborator",
      text:"This employee will be kicked from this project",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willKick) => {
      if (willKick) {
        this.fetch({query:`mutation {
          collaborator_delete(_id:"`+id_collaborator+`"){_id}
        }`})
        var data_collaborator = this.state.data_collaborator.filter(function(item){ return item.id !== id_employee })
        var employee = this.state.data_collaborator.filter(function(item){ return item.id === id_employee })
        this.setState({
          data_collaborator:data_collaborator,
          employee:[...this.state.employee,employee[0]]
        })
        var activity_id = this.props.objectId()
        var activity_code = 'I4'
        var activity_detail = employee[0]['name']+'_'+employee[0]['division_name']
        var activity_date = new Date()
        this.fetch({query:`
          mutation {
            activity_add(
              _id:"`+activity_id+`",
              project:"`+this.state.project_id+`",
              code:"`+activity_code+`",
              detail:"`+activity_detail+`",
              date:"`+activity_date+`"
            ){_id}
          }`
        })
        this.props.activity(activity_code,activity_detail,activity_date)
        NotificationManager.success(success)
      }
    })
  }

  //invite modal
  invite_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.invite_modal}
        onHide={()=>this.setState({invite_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Invite Collaborator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Division</Form.Label>
                <Form.Control as="select" onChange={(e)=>this.invite_option(e.target.value)}>
                  <option value="all">All Division</option>
                  {this.state.division.map((item,index) => {
                    return <option value={item.id} key={index}>{item.name}</option>
                  })}
                </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Employee</Form.Label>
              <Form.Control as="select" id="tambah_employee">
                <option value="" hidden>Select employee</option>
                {this.state.invite_employee.map((item,index) => {
                  return <option value={item.id} key={index}>{item.name}</option>
                })}
              </Form.Control>
              <div id="tambah_femployee" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.invite_handler()}>
            Invite
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //render
  render() {
    return (
      <div>
        {this.invite_modal()}
        <Tab.Container defaultActiveKey="TAB1">
          <Card>
            <Card.Header>
              <Row>
                <Col>
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="TAB1">Collaborator</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="TAB2">Pending</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col className="text-right">
                  {localStorage.getItem('leader') === '1' &&
                    <Button
                      size="sm"
                      variant="outline-dark"
                      disabled={this.state.header_button}
                      onClick={()=>this.invite_open()}
                    >
                      Invite
                    </Button>
                  }
                  <span style={{paddingRight:15}}/>
                  <Button
                    size="sm"
                    variant="outline-dark"
                    disabled={this.state.header_button}
                    onClick={()=>this.reload()}
                  >
                    {this.state.header_refresh}
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Tab.Content>
              <Tab.Pane eventKey="TAB1">
                <div className="container-detail-project">
                  <ListGroup variant="flush">
                    {this.state.data_collaborator.length === 0 &&
                      <ListGroup.Item>
                        <div style={{fontWeight:600}}>Empty</div>
                        <div>There is no collaborator in this project</div>
                      </ListGroup.Item>
                    }
                    {
                      this.state.data_collaborator.length !== 0 &&
                      this.state.data_collaborator.map((item,index) => {
                        return (
                          <ListGroup.Item key={index}>
                            <Row><Col>
                              <div style={{fontWeight:600}}>{item.name}</div>
                              <small className="text-muted">{item.division_name} Division. Email {item.email} / Contact {item.contact}</small>
                            </Col><Col className="text-right">
                              {localStorage.getItem('leader') === '1' &&
                                <div style={{paddingTop:8}}>
                                  <div
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={()=>this.invite_kick(item.id,item.collaborator)}
                                  >
                                    Kick
                                  </div>
                                </div>
                              }
                            </Col></Row>     
                          </ListGroup.Item>
                        )
                      })
                    }
                  </ListGroup>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="TAB2">
                <div className="container-detail-project">
                  <ListGroup variant="flush">
                    {
                      this.state.data_pending.length === 0 &&
                      <ListGroup.Item>
                        <div style={{fontWeight:600}}>Empty</div>
                        <div>There is no pending invitation in this project</div>
                      </ListGroup.Item>
                    }
                    {
                      this.state.data_pending.length !== 0 &&
                      this.state.data_pending.map((item,index) => {
                        return (
                          <ListGroup.Item key={index}>
                            <Row>
                              <Col>
                                <div style={{fontWeight:600}}>{item.name}</div>
                                <small>{item.division_name} • {item.email} / {item.contact}</small>
                              </Col>
                              <Col className="text-right">
                                {localStorage.getItem('leader') === '1' &&
                                  <div style={{paddingTop:8}}>
                                    <div
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={()=>this.invite_cancel(item.id,item.collaborator)}
                                    >
                                      Cancel Invite
                                    </div>
                                  </div>
                                }
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        )
                      })
                    }
                  </ListGroup>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Card>
        </Tab.Container>
      </div>
    )
  }

}