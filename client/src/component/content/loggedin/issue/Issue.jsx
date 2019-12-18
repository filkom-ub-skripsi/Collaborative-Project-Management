import React from 'react'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { Card, Badge, Row, Col, Form, Button, Modal } from 'react-bootstrap'
import { Send } from 'react-feather'

//prewrap
const prewrap = { whiteSpace:'pre-wrap' }
const padding = { paddingTop:15 }

//notification
const success = 'Your changes have been successfully saved'

//edit
const issue_edit_form = [
  {field:'sunting_name',feedback:'sunting_fname'},
  {field:'sunting_detail',feedback:'sunting_fdetail'},
]

//class
export default class ContentIssue extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      issue:{name:'Loading...',detail:null,employee:null,employee_id:null,status:null},
      comment:[],edit_modal:false,
    }
  }

  //get derived state from props
  static getDerivedStateFromProps(props,state) {
    if (props.data[0] !== state.issue) {
      return { issue:props.data[0] }
    }
    if (props.comment !== state.comment) {
      return { comment:props.comment }
    }
    if (props.loading !== state.loading) {
      return { loading:props.loading }
    }
    return null
  }

  //form validation
  form_validation(form){
    var counter = 0
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
    var field = document.getElementById('tambah_comment')
    if (field.value.length !== 0) {
      this.props.commentHandler(field.value)
      field.value = ''
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
      }
    })
  }

  //edit modal
  edit_modal(){
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
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" as="textarea" rows="5" id="sunting_detail" defaultValue={this.state.issue.detail}/>
              <div id="sunting_fdetail" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.edit_save()}>
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
      this.props.save(value('sunting_name'),value('sunting_detail'))
      this.setState({edit_modal:false})
      NotificationManager.success(success)
    }
  }

  //render
  render() {

    var status = null
    if (this.state.issue.status === '0') { status = <Badge variant="warning">unsolved</Badge> }
    else if (this.state.issue.status === '1') { status = <Badge variant="success">resolved</Badge> }

    var reload = null
    if (this.props.loading === 'disabled') { reload = 'Loading...' }
    else if (this.props.loading === '') { reload = 'Reload' }

    return (
      <div>
        {this.edit_modal()}
        <Card className="animated faster fadeIn">
          <Card.Body>
            <Row>
              <Col>
                <div style={{fontWeight:600}}>{this.state.issue.name} {status}</div>
                <small className="text-muted">Created by {this.state.issue.employee}</small>
              </Col>
              <Col className="text-right">
                {this.state.issue.employee_id === localStorage.getItem('user') &&
                  <div>
                    <a href="#!" onClick={()=>this.setState({edit_modal:true})} className={this.props.loading}>Edit </a>/
                    <a href="#!" onClick={()=>this.props.reload()} className={this.props.loading}> {reload}</a>
                  </div>
                }
              </Col>
            </Row>
            <hr style={{marginTop:10,marginBottom:10}}/>
            <div style={prewrap}>{this.state.issue.detail}</div>
          </Card.Body>
        </Card>
        <Form autoComplete="off" style={padding} className="animated faster fadeIn">
          <Form.Row>
            <Col lg={11}>
              <Form.Control
                type="text"
                id="tambah_comment"
                placeholder="Leave a comment..."
              />
            </Col>
            <Col>
              <Button
                block
                onClick={()=>this.commentHandler()}
              >
                <Send size={18}/>
              </Button>
            </Col>
          </Form.Row>
        </Form>
        <div className="qa-message-list" style={padding}>
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
      </div>
    )
  }

}