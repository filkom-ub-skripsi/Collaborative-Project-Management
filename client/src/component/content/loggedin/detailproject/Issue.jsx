import React from 'react'
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
  {field:'tambah_requirement',feedback:'tambah_frequirement'},
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
      add_issue_modal:false,data:[],myName:null,
      module:[],requirement:[],filter:[],filterState:true
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //get derived state from props
  static getDerivedStateFromProps(props) {
    var module = []
    var requirement = []
    props.requirement.forEach(function(item_module){
      module.push({
        id:item_module._id,
        name:item_module.name
      })
      item_module.requirement.forEach(function(item_requirement){
        requirement.push({
          id:item_requirement._id,
          name:item_requirement.name,
          module:item_module.name,
          module_id:item_module._id
        })
      })
    })
    return {
      module:module,
      requirement:requirement,
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    //data
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        issue { _id, name, status,
          employee { _id, name }
          requirement { _id, name,
            module { _id, name }
          }
        }
      }
    }`}).then(result => {
      var data = []
      result.data.project.issue.forEach(function(item){
        const requirement = item.requirement[0]
        const module = requirement.module[0]
        data.push({
          id:item._id,name:item.name,status:item.status,
          module:module.name,module_id:module._id,
          requirement:requirement.name,requirement_id:requirement._id,
          employee:item.employee[0]['name'],employee_id:item.employee[0]['_id']
        })
      })
      this.setState({
        data:data,
        header_button:false,
        header_refresh:refresh_default,
      })
      this.props.update(data)
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
    const filter = (id) => {
      this.setState({filterState:false})
      if (id !== '') {
        const filter = this.state.requirement.filter(function(item){ return item.module_id === id.split('_')[0] })
        this.setState({filter:filter})
      }
    }
    return (
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_issue_modal}
        onHide={()=>this.setState({add_issue_modal:false,filterState:true})}
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
              <Form.Label>About</Form.Label>
              <Form.Row>
                <Col>
                  <Form.Control as="select" onChange={(e)=>filter(e.target.value)}>
                    <option value="" hidden>Select Module</option>
                    {this.state.module.map((item,index) => {
                      return <option value={item.id} key={index}>{item.name}</option>
                    })}
                  </Form.Control>
                </Col>
                <Col>
                  <Form.Control as="select" id="tambah_requirement" disabled={this.state.filterState}>
                    <option value="" hidden>Select Requirement</option>
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
      var id = this.props.objectId()
      var project = this.state.project_id
      var requirement = this.state.requirement.filter(function(item){ return item.id === value('tambah_requirement') })
      this.fetch({query:`mutation {
        issue_add(
          _id:"`+id+`",
          project:"`+project+`",
          requirement:"`+requirement[0]['id']+`",
          employee:"`+localStorage.getItem('user')+`",
          name:"`+value('tambah_name')+`",
          detail:"`+this.insert_replace(value('tambah_detail'))+`",
          status:"0"
        ){_id}
      }`})
      this.setState({
        add_issue_modal:false,
        data:[...this.state.data,{
          id:id,name:value('tambah_name'),status:'0',
          module:requirement[0]['module'],module_id:requirement[0]['module_id'],
          requirement:requirement[0]['name'],requirement_id:requirement[0]['id'],
          employee:this.state.myName,employee_id:localStorage.getItem('user')
        }]
      })
      var activity_id = this.props.objectId()
      var activity_code = 'S0'
      var activity_detail = value('tambah_name')+'_'+requirement[0]['name']+'_'+requirement[0]['module']+'_'+this.state.myName
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
      this.props.update(this.state.data)
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
              if (item.status === '0') { status = <Badge variant="warning">open</Badge> }
              else if (item.status === '1') { status = <Badge variant="danger">closed</Badge> }
              return (
                <Link
                  key={index}
                  to={'/issue/'+item.id}
                  className="list-group-item list-group-item-action"
                >
                  <div style={{fontWeight:600}}>{item.name} {status}</div>
                  <small>Created by {item.employee}. Issue about {item.requirement} Requirement of {item.requirement} Module.</small>
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