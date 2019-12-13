import React from 'react'
import RDS from 'randomstring'
import MD5 from 'md5'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { ListGroup, Modal, Button, Form, Spinner } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import LayoutCardContent from '../../../layout/CardContent'

//notification
const success = 'Your changes have been successfully saved'

//group list
const div = { fontWeight:500 }
const small = { color:'gray' }
const danger = { fontWeight:500, color:'red' }

//spinner
const spinner = <Spinner animation="border" size="sm"/>

//edit
const edit_form = [
  {field:'edit_code',feedback:'edit_fcode'},
  {field:'edit_name',feedback:'edit_fname'},
  {field:'edit_client',feedback:'edit_fclient'},
  {field:'edit_start',feedback:'edit_fstart'},
  {field:'edit_end',feedback:'edit_fend'},
]

//delete
const delete_button = 'Delete'
const delete_form = [
  {field:'delete_name',feedback:'delete_fname'},
  {field:'delete_password',feedback:'delete_fpassword'},
]

//class
export default class ContentSetting extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = { 
      code:this.props.data[0]['code'],name:this.props.data[0]['name'],client_id:this.props.data[0]['client_id'],start:this.props.data[0]['start'],end:this.props.data[0]['end'],
      edit_modal:false,edit_code:'',edit_name:'',edit_client:'',edit_start:'',edit_end:'',
      delete_modal:false,delete_button:delete_button,delete_state:false,
      client:[],status:null,password:null,
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //component will receive props
  UNSAFE_componentWillReceiveProps(props){
    this.setState({
      code:props.data[0]['code'],name:props.data[0]['name'],client_id:props.data[0]['client_id'],start:props.data[0]['start'],end:props.data[0]['end'],
      password:props.pass,status:props.status
    })
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{ 
      organization(_id:"`+localStorage.getItem('organization')+`") {
        client { _id, name }
      }
    }`}).then(result => {
      this.setState({client:result.data.organization.client})
    })
  }

  //start project
  start_project(){
    Swal({
      title:"Start Project?",
      text:"The project will enter the implementation phase",
      icon:"info",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willStart) => {
      if (willStart) {
        NotificationManager.info('Checking all requirements...')
        this.fetch({query:`{
          project(_id:"`+this.props.id+`") {
            module {
              requirement {
                _id
              }
            }
          }
        }`}).then(result => {
          if (result.data.project.module.length !== 0) {
            var data = result.data.project.module.filter(function(item){ return item.requirement.length === 0 })
            if (data.length === 0) {
              var activity_id = RDS.generate({length:32,charset:'alphabetic'})
              var activity_code = 'P3'
              var activity_date = new Date()
              this.fetch({query:`
                mutation {
                  activity_add(
                    _id:"`+activity_id+`",
                    project:"`+this.props.id+`",
                    code:"`+activity_code+`",
                    detail:"",
                    date:"`+activity_date+`"
                  ){_id}
                }`
              })
              Swal({
                title:"Success",
                text:"Your project is now started",
                icon:"success",
                closeOnClickOutside:false,
                button:false,
                timer:1500
              })
              NotificationManager.success('All your requirements are good!')
              this.props.activity(activity_code,'',activity_date)
              this.props.start()
            } else {
              Swal({
                title:"Failed",
                text:"There are still modules that don't have requirements",
                icon:"warning",
                closeOnClickOutside:false,
              })
              NotificationManager.error('Please complete your requirements!')
            }
          } else {
            Swal({
              title:"Failed",
              text:"This project still doesn't have any requirements",
              icon:"warning",
              closeOnClickOutside:false,
            })
            NotificationManager.error('Please add a few requirements before you start the project!')
          }
        })
      }
    })
  }

  //edit modal
  edit_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.edit_modal}
        onHide={()=>this.setState({edit_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Code</Form.Label>
              <Form.Control type="text" id="edit_code" value={this.state.edit_code} onChange={(e)=>this.setState({edit_code:e.target.value})}/>
              <div id="edit_fcode" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="edit_name" value={this.state.edit_name} onChange={(e)=>this.setState({edit_name:e.target.value})}/>
              <div id="edit_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Client</Form.Label>
              <Form.Control id="edit_client" as="select" value={this.state.edit_client} onChange={(e)=>this.setState({edit_client:e.target.value})}>
                {this.state.client.map((item,index) => {
                  return (
                    <option value={item._id} key={index}>{item.name}</option>
                  )
                })}
              </Form.Control>
              <div id="edit_fclient" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Start</Form.Label>
              <Form.Control type="date" id="edit_start" value={this.state.edit_start} onChange={(e)=>this.setState({edit_start:e.target.value})}/>
              <div id="edit_fstart" className="invalid-feedback d-block"/>
            </Form.Group>          
            <Form.Group>
              <Form.Label>End</Form.Label>
              <Form.Control type="date" id="edit_end" value={this.state.edit_end} onChange={(e)=>this.setState({edit_end:e.target.value})}/>
              <div id="edit_fend" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.edit_project()}
          >
            Edit
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //edit open modal
  edit_open_modal(){
    this.setState({
      edit_code:this.state.code,
      edit_name:this.state.name,
      edit_client:this.state.client_id,
      edit_start:this.state.start,
      edit_end:this.state.end,
      edit_modal:true,
    })
  }

  //edit validation
  edit_validation(){
    var counter = 0
    edit_form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
        document.getElementById(item.feedback).innerHTML = 'this field cannot be empty'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        document.getElementById(item.feedback).innerHTML = ''
        counter++
      }
    })
    if (counter === edit_form.length) {
      return true
    }
  }

  //edit handler
  edit_project(){
    if (this.edit_validation() === true) {
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code = 'P2'
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.props.id+`",
            code:"`+activity_code+`",
            detail:"",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.setState({edit_modal:false})
      this.props.edit(this.state.edit_code,this.state.edit_name,this.state.edit_client,this.state.edit_start,this.state.edit_end)
      this.props.activity(activity_code,'',activity_date)
      NotificationManager.success(success)
    }
  }

  //delete modal
  delete_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.delete_modal}
        onHide={()=>this.setState({delete_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Project Name</Form.Label>
              <Form.Control type="text" id="delete_name"/>
              <div id="delete_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" id="delete_password"/>
              <div id="delete_fpassword" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            disabled={this.state.delete_state}
            onClick={()=>this.delete_project()}
          >
            {this.state.delete_button}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //delete validation
  delete_validation(){
    var counter = 0
    var name = this.state.name
    var pass = this.state.password
    delete_form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
        document.getElementById(item.feedback).innerHTML = 'this field cannot be empty'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        document.getElementById(item.feedback).innerHTML = ''
        if (item.field === 'delete_name') {
          if (document.getElementById(item.field).value === name) { counter++ }
          else {
            document.getElementById(item.field).className = 'form-control is-invalid'
            document.getElementById(item.feedback).innerHTML = 'project name does not match'
          }
        }
        if (item.field === 'delete_password') { 
          if (MD5(document.getElementById(item.field).value) === pass) { counter++ }
          else {
            document.getElementById(item.field).className = 'form-control is-invalid'
            document.getElementById(item.feedback).innerHTML = 'wrong password'
          }
        }
      }
    })
    if (counter === delete_form.length) {
      return true
    }
  }

  //delete handler
  delete_project(){
    if (this.delete_validation() === true) {
      this.setState({delete_button:spinner,delete_state:true})
      this.fetch({query:`{
        project(_id:"`+this.props.id+`") {
          module {_id}
        }
      }`}).then(result => {
        this.setState({delete_button:delete_button,delete_state:false,delete_modal:false})
        if (result.data.project.module.length === 0) {
          this.fetch({
            query:`{
              project(_id:"`+this.props.id+`") {
                activity{_id}
              }
            }`
          }).then(result => {
            const delActivity = (query) => this.fetch({query:query})
            result.data.project.activity.forEach(function(item){
              delActivity('mutation{activity_delete(_id:"'+item._id+'"){_id}}')
            })
            this.fetch({query:`
              mutation {
                project_delete(_id:"`+this.props.id+`"){_id}
              }`
            })
          })
          Swal({
            title:"Success",
            text:"Your project was successfully deleted",
            icon:"success",
            closeOnClickOutside:false,
            button:false
          })
          setTimeout(()=>{window.location.href='/projects'},1500)
        } else {
          Swal({
            title:"Failed",
            text:"Project requirement must be empty",
            icon:"warning",
            closeOnClickOutside:false,
          })
        }
      })
    }
  }

  //card header
  card_header() {
    return <b style={{fontSize:20}}>Project Setting</b>
  }

  //card body
  card_body() {
    return (
      <ListGroup variant="flush">
        {this.state.status === null &&
          <ListGroup.Item>
            <div style={div}>Loading...</div>
            <small style={small}>Settings menu is only available if project data has been loaded</small>
          </ListGroup.Item>
        }
        {this.state.status === '0' &&
          <div>
            <ListGroup.Item action onClick={()=>this.start_project()}>
              <div style={div}>Start Project</div>
              <small style={small}>Entering the project implementation stage. After the project has started, all requirements that have been initialized cannot be changed and deleted, nor can the project review.</small>
            </ListGroup.Item>
            <ListGroup.Item action onClick={()=>this.edit_open_modal()}>
              <div style={div}>Edit Project</div>
              <small style={small}>Editing project main data related to the agreement between the project manager and the client. Projects that can be edited are only projects that have not yet been started.</small>
            </ListGroup.Item>
            <ListGroup.Item action onClick={()=>this.setState({delete_modal:true})}>
              <div style={danger}>Delete Project</div>
              <small style={small}>Strongly not recommended. Projects that can be deleted are only projects that have not yet been started, provided the requirements are still empty.</small>
            </ListGroup.Item>
          </div>
        }
        {this.state.status === '1' &&
          <ListGroup.Item action>
            <div style={div}>Close Project</div>
            <small style={small}>Entering the project review stage. After the project has closed, all data in this project cannot be changed and deleted, but you can still download the report of this project</small>
          </ListGroup.Item>
        }
      </ListGroup>
    )
  }

  //render
  render() {
    return (
      <div>
        {this.edit_modal()}
        {this.delete_modal()}
        <LayoutCardContent
          header={this.card_header()}
          body={this.card_body()}
          table={true}
        />
      </div>
    )
  }

}