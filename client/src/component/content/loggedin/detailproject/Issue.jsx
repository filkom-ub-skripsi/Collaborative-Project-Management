import React from 'react'
import RDS from 'randomstring'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { Row, Col, Button, ListGroup, Modal, Form, Badge } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import { RefreshCcw } from 'react-feather'
import LayoutCardContent  from '../../../layout/CardContent'

//refresh
const refresh_default = <RefreshCcw size={15} style={{marginBottom:2}}/>
const refresh_loading = 'Loading...'

//issue
const issue_add_form = [
  {field:'tambah_name',feedback:'tambah_fname'},
  {field:'tambah_detail',feedback:'tambah_fdetail'},
]

//notification
const success = 'Your changes have been successfully saved'

//class
export default class ContentIssue extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
      header_button:true,header_refresh:refresh_loading,
      add_issue_modal:false,data:[],myName:null
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
    //data
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        issue { _id, name, detail, status,
          employee { _id, name }
        }
      }
    }`}).then(result => {
      this.props.update(result.data.project.issue)
      var data = []
      result.data.project.issue.forEach(function(item){
        data.push({
          id:item._id,
          name:item.name,
          detail:item.detail,
          status:item.status,
          employee:item.employee[0]['name'],
          employee_id:item.employee[0]['_id']
        })
      })
      this.setState({
        data:data,
        header_button:false,
        header_refresh:refresh_default,
      })
    })
    //name
    this.fetch({query:`{
      employee(_id:"`+localStorage.getItem('user')+`"){name}
    }`}).then(result => {
      this.setState({myName:result.data.employee.name})
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

  //replace \n
  insert_replace(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'\\n')
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

  //add issue modal
  add_issue_modal(){
    return (
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_issue_modal}
        onHide={()=>this.setState({add_issue_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" as="textarea" rows="5" id="tambah_detail"/>
              <div id="tambah_fdetail" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_issue_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //add issue handler
  add_issue_handler(){
    if (this.form_validation(issue_add_form) === true) {
      const value = (id) => { return document.getElementById(id).value }
      var id = RDS.generate({length:32,charset:'alphabetic'})
      var project = this.state.project_id
      this.fetch({query:`mutation {
        issue_add(
          _id:"`+id+`",
          project:"`+project+`",
          employee:"`+localStorage.getItem('user')+`",
          name:"`+value('tambah_name')+`",
          detail:"`+this.insert_replace(value('tambah_detail'))+`",
          status:"0"
        ){_id}
      }`})
      this.setState({
        add_issue_modal:false,
        data:[...this.state.data,{
          id:id,
          name:value('tambah_name'),
          detail:this.insert_replace(value('tambah_detail')),
          status:'0',employee:this.state.myName,employee_id:localStorage.getItem('user')
        }]
      })
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code = 'S0'
      var activity_detail = value('tambah_name')+'_'+this.state.myName
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

  //card header
  card_header(){
    return (
      <Row>
        <Col><b style={{fontSize:20}}>Issues</b></Col>
        <Col className="text-right">
          <Button
            size="sm"
            variant="outline-dark"
            disabled={this.state.header_button}
            onClick={()=>this.setState({add_issue_modal:true})}
          >
            Add
          </Button>
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
    )
  }

  //card body
  card_body(){
    return (
      <div className="container-detail-project">
        <ListGroup variant="flush">
          {
            this.state.data.length === 0 &&
            <ListGroup.Item>
              <div style={{fontWeight:600}}>Empty</div>
              <div style={{color:'grey'}}>There is no issues in this project</div>
            </ListGroup.Item>
          }
          {
            this.state.data.length !== 0 &&
            this.state.data.map((item,index) => {
              var status = null
              if (item.status === '0') { status = <Badge variant="warning">unsolved</Badge> }
              else if (item.status === '1') { status = <Badge variant="success">resolved</Badge> }
              return (
                <Link
                  key={index}
                  to={'/issue/'+item.id}
                  className="list-group-item list-group-item-action"
                >
                  <div style={{fontWeight:600}}>{item.name} {status}</div>
                  <div style={{color:'grey'}}>created by {item.employee}</div>
                </Link>
              )
            })
          }
        </ListGroup>
      </div>
    )
  }

  //render
  render() {
    return (
      <div>
        {this.add_issue_modal()}
        <LayoutCardContent
          header={this.card_header()}
          body={this.card_body()}
          table={true}
        />
      </div>
    )
  }

}