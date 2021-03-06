import React from 'react'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Card, Badge, Row, Col, Form, Button, Modal, Spinner } from 'react-bootstrap'
import { Send } from 'react-feather'

//prewrap
const prewrap = { whiteSpace:'pre-wrap' }

//notification
const success = 'Your changes have been successfully saved'

//edit
const issue_edit_form = [
  {field:'sunting_name',feedback:'sunting_fname'},
  {field:'sunting_detail',feedback:'sunting_fdetail'},
]

//delete
const delete_false = 'Delete'
const delete_true = <Spinner animation="border" size="sm"/>

//class
export default class ContentIssue extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      issue:{name:null,detail:null,requirement:null,requirement_id:null,module:null,module_id:null,employee:null,employee_id:null,status:null},
      module:[],requirement:[],filter:[],filter_module:null,filter_requirement:null,comment:[],
      edit_modal:false,delete_button:delete_false,delete_state:false,issue_id:null,project_id:null
    }
  }

  //get derived state from props
  static getDerivedStateFromProps(props,state) {
    return {
      issue:props.data,
      comment:props.comment,
      module:props.module,
      requirement:props.requirement,
      issue_id:props.issue_id,
      project_id:props.project_id,
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //form validation
  form_validation(form){
    let counter = 0
    form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
        document.getElementById(item.feedback).innerHTML = 'this field cannot be empty'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        document.getElementById(item.feedback).innerHTML = ''
        counter++
      }
    })
    if (counter === form.length) {
      return true
    }
  }

  //comment handler
  commentHandler(){
    let field = document.getElementById('tambah_comment')
    if (field.value.length !== 0) {
      this.props.commentHandler(field.value); field.value = '';
      NotificationManager.success(success)
    }
  }

  //comment delete
  commentDelete(id){
    Swal({
      title:"Delete",text:"This comment will be deleted",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        this.props.commentDelete(id)
        NotificationManager.success(success)
      }
    })
  }

  //edit open
  edit_open(){
    let filter_requirement = this.state.issue.requirement_id
    let filter_module = this.state.issue.module_id
    let filter = this.state.requirement.filter(function(item){return item.module_id === filter_module})
    this.setState({
      edit_modal:true,
      filter_module:filter_module,
      filter_requirement:filter_requirement,
      filter:filter
    })
  }

  //edit modal
  edit_modal(){
    const filter = (id) => {
      let filter = this.state.requirement.filter(function(item){ return item.module_id === id })
      this.setState({filter:filter})
    }
    return (
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.edit_modal}
        onHide={()=>this.setState({edit_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="sunting_name" defaultValue={this.state.issue.name}/>
              <div id="sunting_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>About</Form.Label>
              <Form.Row>
                <Col>
                  <Form.Control as="select" defaultValue={this.state.filter_module} onChange={(e)=>filter(e.target.value)}>
                    {this.state.module.map((item,index) => {
                      return <option value={item.id} key={index}>{item.name}</option>
                    })}
                  </Form.Control>
                </Col>
                <Col>
                  <Form.Control as="select" defaultValue={this.state.filter_requirement} id="sunting_requirement">
                    {this.state.filter.map((item,index) => {
                      return <option value={item.id} key={index}>{item.name}</option>
                    })}
                  </Form.Control>
                </Col>
              </Form.Row>
              <Row><Col/><Col><div id="tambah_frequirement" className="invalid-feedback d-block"/></Col></Row>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" as="textarea" rows="5" id="sunting_detail" defaultValue={this.state.issue.detail}/>
              <div id="sunting_fdetail" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            disabled={this.state.delete_state}
            onClick={()=>this.edit_delete()}
          >
            {this.state.delete_button}
          </Button>
          <Button
            disabled={this.state.delete_state}
            onClick={()=>this.edit_save()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //edit save
  edit_save(){
    if (this.form_validation(issue_edit_form) === true) {
      const value = (id) => { return document.getElementById(id).value }
      this.props.save(value('sunting_name'),value('sunting_detail'),value('sunting_requirement'))
      this.setState({edit_modal:false})
      NotificationManager.success(success)
    }
  }

  //edit delete
  edit_delete(){
    Swal({
      title:"Delete",text:"This issue will be deleted",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        this.setState({
          delete_state:true,
          delete_button:delete_true
        })
        this.fetch({query:`{
          issue(_id:"`+this.state.issue_id+`") {
            task { _id }
            comment { _id }
          }
        }`}).then(result => {
          if (result.data.issue.task.length === 0) {
            const fetch = (query) => this.fetch({query:query})
            result.data.issue.comment.forEach(function(item){
              fetch('mutation{comment_delete(_id:"'+item._id+'"){_id}}')
            })
            fetch('mutation{issue_delete(_id:"'+this.state.issue_id+'"){_id}}')
            fetch(`mutation {
              activity_add(
                _id:"`+this.props.objectId()+`",
                project:"`+this.state.project_id+`",
                code:"S4",
                detail:"`+this.state.issue.name+`",
                date:"`+new Date()+`"
              ){_id}
            }`)
            Swal({
              title:"Success",text:"This issue is successfully deleted",
              icon:"success",closeOnClickOutside:false,button:false
            })
            this.setState({
              delete_state:false,
              delete_button:delete_false
            })
            setTimeout(()=>{window.location.href='/detail-project/'+this.state.project_id},1500)
          } else {
            Swal({
              title:"Failed",text:"This issue is registered on task",
              icon:"warning",closeOnClickOutside:false,
            })
            this.setState({
              delete_state:false,
              delete_button:delete_false
            })
          }
        })
      }
    })
  }

  //render
  render() {

    let status = null
    let disabled = true
    if (this.state.issue.status === '0' && this.state.delete_state === false) {
      status = <Badge variant="warning">open</Badge>
      disabled = false
    }
    else if (this.state.issue.status === '1') { status = <Badge variant="success">closed</Badge> }

    let reload = null
    let display = { display:'none' }
    if (this.props.loading === 'disabled') { reload = 'Loading...' }
    else if (this.props.loading === '') {
      reload = 'Reload'
      display = { display:'block' }
    }

    return (
      <div>
        {this.edit_modal()}
        <Card className="animated faster fadeIn">
          <Card.Body>
            <Row>
              <Col lg={10}>
                <div style={{fontWeight:600}}>{this.state.issue.name} {status}</div>
                <small className="text-muted" style={display}>Created by {this.state.issue.employee}. Issue about {this.state.issue.requirement} Requirement of {this.state.issue.module} Module.</small>
              </Col>
              <Col lg={2} className="text-right">
                {this.state.issue.employee_id === localStorage.getItem('user') && this.state.issue.status === '0' &&
                  <div>
                    <a href="#!" onClick={()=>this.edit_open()} className={this.props.loading}>Edit </a>/
                    <a href="#!" onClick={()=>this.props.reload()} className={this.props.loading}> {reload}</a>
                  </div>
                }
              </Col>
            </Row>
            <hr style={{marginTop:10,marginBottom:10}}/>
            <div style={prewrap}>{this.state.issue.detail}</div>
          </Card.Body>
        </Card>
        <div className="qa-message-list" style={{paddingTop:25}}>
          {this.state.comment.map((item,index) => {
            return (
              <div className="message-item animated faster fadeIn" key={index}>
                <div className="message-inner">
                  <div className="message-head clearfix">
                    <div className="user-detail">
                      <Row>
                        <Col>
                          <div style={{fontWeight:600}}>{item.employee}</div>
                        </Col>
                        <Col className="text-right">
                          {item.employee_id === localStorage.getItem('user') &&
                            <a href="#!" onClick={()=>this.commentDelete(item.id)}>Delete</a>
                          }
                        </Col>
                      </Row>
                    </div>
                  </div>
                  <div className="qa-message-content">
                    {item.comment}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <Form autoComplete="off" className="animated faster fadeIn">
          <Form.Row>
            <Col lg={11}>
              <Form.Control
                type="text"
                id="tambah_comment"
                placeholder="Leave a comment..."
                disabled={disabled}
              />
            </Col>
            <Col>
              <Button
                block
                disabled={this.state.delete_state}
                onClick={()=>this.commentHandler()}
              >
                <Send size={18}/>
              </Button>
            </Col>
          </Form.Row>
        </Form>
      </div>
    )
  }

}