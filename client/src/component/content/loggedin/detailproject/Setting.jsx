import React from 'react'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { ListGroup, Modal, Button, Form } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import LayoutCardContent from '../../../layout/CardContent'

//notification
const success = 'Your changes have been successfully saved'

//group list
const div = { fontWeight:500 }
const small = { color:'gray' }
const danger = { fontWeight:500, color:'red' }

//edit
const edit_form = [
  {field:'edit_code',feedback:'edit_fcode'},
  {field:'edit_name',feedback:'edit_fname'},
  {field:'edit_client',feedback:'edit_fclient'},
  {field:'edit_start',feedback:'edit_fstart'},
  {field:'edit_end',feedback:'edit_fend'},
]

//delete
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
      project_id:this.props.id,
      edit_modal:false,delete_modal:false,
      client:[],password:null,status:null,
      overview:{code:null,name:null,client:null,client_id:null,start:null,end:null},
      requirement:[],
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //get derived state from props
  static getDerivedStateFromProps(props) {
    return {
      overview:props.data[0],
      requirement:props.requirement,
      status:props.status,
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    //client
    this.fetch({query:`{ 
      organization(_id:"`+localStorage.getItem('organization')+`") {
        client { _id, name }
      }
    }`}).then(result => {
      this.setState({client:result.data.organization.client})
    })
    //password
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        employee { password },
      }
    }`}).then(result => {
      this.setState({
        password:result.data.project.employee[0]['password'],
      })
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
        if (this.state.requirement.length !== 0) {
          let checkRequirement = 0
          this.state.requirement.forEach(function(item){
            if (item.requirement.length === 0) { checkRequirement = 1 }
          })
          if (checkRequirement === 0) {
            const fetch = (query) => this.fetch({query:query})
            let project_id = this.state.project_id
            let start = this.state.overview.start
            this.state.requirement.forEach(function(module){
              fetch(`mutation {
                gantt_add(
                  _id:"`+module.id.split('_')[0]+`",
                  project:"`+project_id+`",
                  name:"`+module.name+`",
                  start:"`+start+` 00:00",
                  duration:"7",
                  parent:""
                ){_id}
              }`)
              module.requirement.forEach(function(requirement){
                fetch(`mutation {
                  gantt_add(
                    _id:"`+requirement.id+`",
                    project:"`+project_id+`",
                    name:"`+requirement.name+`",
                    start:"`+start+` 00:00",
                    duration:"3",
                    parent:"`+module.id.split('_')[0]+`"
                  ){_id}
                }`)
              })
            })
            let activity_id = this.props.objectId()
            let activity_code = 'P3'
            let activity_date = new Date()
            this.fetch({query:`mutation {
              activity_add(
                _id:"`+activity_id+`",
                project:"`+project_id+`",
                code:"`+activity_code+`",
                detail:"",
                date:"`+activity_date+`"
              ){_id}
            }`})
            Swal({
              title:"Success",text:"Your project is now started",
              icon:"success",closeOnClickOutside:false,button:false,timer:1500
            })
            this.props.activity(activity_code,'',activity_date)
            this.props.update([])
            this.props.start()
          } else {
            Swal({
              title:"Failed",text:"There are still modules that don't have requirements",
              icon:"warning",closeOnClickOutside:false,
            })
          }
        } else {
          Swal({
            title:"Failed",text:"This project still doesn't have any requirements",
            icon:"warning",closeOnClickOutside:false,
          })
        }
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
              <Form.Control type="text" id="edit_code" defaultValue={this.state.overview.code}/>
              <div id="edit_fcode" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="edit_name" defaultValue={this.state.overview.name}/>
              <div id="edit_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Client</Form.Label>
              <Form.Control id="edit_client" as="select" defaultValue={this.state.overview.client_id}>
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
              <Form.Control type="date" id="edit_start" defaultValue={this.state.overview.start}/>
              <div id="edit_fstart" className="invalid-feedback d-block"/>
            </Form.Group>          
            <Form.Group>
              <Form.Label>End</Form.Label>
              <Form.Control type="date" id="edit_end" defaultValue={this.state.overview.end}/>
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

  //edit validation
  edit_validation(){
    let counter = 0
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
      this.setState({edit_modal:false})
      const value = (id) => { return document.getElementById(id).value }
      this.props.edit(
        value('edit_code'),
        value('edit_name'),
        value('edit_client'),
        value('edit_start'),
        value('edit_end')
      )
      let activity_id = this.props.objectId()
      let activity_code = 'P2'
      let activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
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
            onClick={()=>this.delete_project()}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //delete validation
  delete_validation(){
    const hashMD5 = (password) => { return this.props.hashMD5(password) }
    let counter = 0
    let name = this.state.overview.name
    let pass = this.state.password
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
          if (hashMD5(document.getElementById(item.field).value) === pass) { counter++ }
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
      if (this.state.requirement.length === 0) {
        const delActivity = (query) => this.fetch({query:query})
        this.fetch({query:`{
          project(_id:"`+this.state.project_id+`") { activity {_id} }
        }`}).then(result => {
          result.data.project.activity.forEach(function(item){
            delActivity('mutation{activity_delete(_id:"'+item._id+'"){_id}}')
          })
        })
        this.fetch({query:`mutation{
          project_delete(_id:"`+this.state.project_id+`"){_id}
        }`})
        Swal({
          title:"Success",text:"Your project is successfully deleted",
          icon:"success",closeOnClickOutside:false,button:false
        })
        this.setState({delete_modal:false})
        setTimeout(()=>{window.location.href='/projects'},1500)
      } else {
        Swal({
          title:"Failed",text:"Project requirement must be empty",
          icon:"warning",closeOnClickOutside:false,
        })
      }
    }
  }

  //close project
  close_project(){
    Swal({
      title:"Close Project?",
      text:"This project will be closed but you can restart this project",
      icon:"info",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willClose) => {
      if (willClose) {
        let project_id = this.state.project_id
        let activity_id = this.props.objectId()
        let activity_code = 'P4'
        let activity_date = new Date()
        this.fetch({query:`mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+project_id+`",
            code:"`+activity_code+`",
            detail:"",
            date:"`+activity_date+`"
          ){_id}
        }`})
        Swal({
          title:"Success",text:"Your project is now closed",
          icon:"success",closeOnClickOutside:false,button:false,timer:1500
        })
        this.props.activity(activity_code,'',activity_date)
        this.props.close()
      }
    })
  }

  //restart project
  restart_project(){
    Swal({
      title:"Restart Project?",
      text:"This project will be started again",
      icon:"info",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willClose) => {
      if (willClose) {
        let project_id = this.state.project_id
        let activity_id = this.props.objectId()
        let activity_code = 'P5'
        let activity_date = new Date()
        this.fetch({query:`mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+project_id+`",
            code:"`+activity_code+`",
            detail:"",
            date:"`+activity_date+`"
          ){_id}
        }`})
        Swal({
          title:"Success",text:"Your project is now restarted",
          icon:"success",closeOnClickOutside:false,button:false,timer:1500
        })
        this.props.activity(activity_code,'',activity_date)
        this.props.start()
      }
    })
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
            <ListGroup.Item action onClick={()=>this.setState({edit_modal:true})}>
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
          <ListGroup.Item action onClick={()=>this.close_project()}>
            <div style={div}>Close Project</div>
            <small style={small}>Entering the project review stage. After the project has closed, all data in this project cannot be changed and deleted, but you can still download the report of this project</small>
          </ListGroup.Item>
        }
        {this.state.status === '2' &&
          <ListGroup.Item action onClick={()=>this.restart_project()}>
            <div style={div}>Restart Project</div>
            <small style={small}>Turn back to the project implementation stage.</small>
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