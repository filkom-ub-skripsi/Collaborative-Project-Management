import React from 'react'
import Select from 'react-select'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Tab, Card, Nav, Row, Col, Button, OverlayTrigger, Popover, Modal, Form } from 'react-bootstrap'
import { RefreshCcw, HelpCircle } from 'react-feather'
import LayoutTable from '../../../layout/Table'

//notification
const success = 'Your changes have been successfully saved'

//type
const type_0 = 'Requirement'
const type_1 = 'Issue'

//class
export default class ContentScrum extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,leader:null,
      backlog:[],sprint:[],
      data_loading:true,header_button:true,
      module:[],requirement:[],issue:[],
      collaborator:[],employee:[],
      add_backlog_modal:false,
      add_backlog_requirement:{display:'none'},
      add_backlog_issue:{display:'none'},
      add_backlog_requirement_disabled:true,
      add_backlog_filter:[],
      add_backlog_team:[],
      add_backlog_disabled:true,
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //get derived state from props
  static getDerivedStateFromProps(props,state) {
    //requirement
    let module = []
    let requirement = []
    props.requirement.forEach(function(item_module){
      module.push({
        id:item_module._id,
        name:item_module.name
      })
      item_module.requirement.forEach(function(item_requirement){
        let exist = 0
        state.backlog.forEach(function(item_backlog){
          if (
            item_backlog.task_id === item_requirement._id &&
            item_backlog.type === type_0
          ){
            exist = 1
          }
        })
        if (exist === 0) {
          requirement.push({
            id:item_requirement._id,
            name:item_requirement.name,
            module:item_module.name,
            module_id:item_module._id
          })
        }
      })
    })
    //issue
    let issue = []
    props.issue.forEach(function(item_issue){
      let exist = 0
      state.backlog.forEach(function(item_backlog){
        if (
          item_backlog.task_id === item_issue.id &&
          item_backlog.type === type_1
        ){
          exist = 1
        }
      })
      if (exist === 0) {
        issue.push(item_issue)
      }
    })
    //return
    return {
      collaborator:props.collaborator_accepted.concat(props.collaborator_pending),
      module:module,requirement:requirement,issue:issue,
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        organization {
          leader { leader { _id } }
          employee { _id, name, contact, email, division { _id, name } } 
        }
        task {
          _id, status
          requirement { _id, name }
          issue { _id, name }
          team { employee { _id, name, division { name } } }
        }
      }
    }`}).then(result => {
      let employee = result.data.project.organization[0]['employee']
      let leader = result.data.project.organization[0]['leader'][0]['leader'][0]['_id']
      let backlog = []
      result.data.project.task.forEach(function(item){
        if (item.status === '0') {
          let data = []
          item.team.forEach(function(team){
            data.push({
              id:team.employee[0]['_id'],
              name:team.employee[0]['name'],
              division:team.employee[0]['division'][0]['name']
            })
          })
          if (item.requirement.length !== 0){
            backlog.push({
              id:item._id,
              task:item.requirement[0]['name'],
              task_id:item.requirement[0]['_id'],
              type:type_0,
              team:item.team.length,
              data:data,
            })
          } else if (item.issue.length !== 0) {
            backlog.push({
              id:item._id,
              task:item.issue[0]['name'],
              task_id:item.issue[0]['_id'],
              type:type_1,
              team:item.team.length,
              data:data,
            })
          }
        }
      })
      this.setState({
        employee:employee,leader:leader,backlog:backlog,
        data_loading:false,header_button:false,
      })
    })
  }

  //reload
  reload(){
    this.setState({
      data_loading:true,
      header_button:true,
    })
    this.push()
  }

  //menu add
  menu_add(){
    return (
      <Popover>
        <Popover.Content>
          <Button
            size="sm" variant="outline-dark" block
            onClick={()=>{
              this.add_backlog_open()
              this.refs.overlay.handleHide()
            }}
          >
            Backlog
          </Button>
          <Button
            size="sm" variant="outline-dark" block
            onClick={()=>{

              this.refs.overlay.handleHide()
            }}
          >
            Sprint
          </Button>
        </Popover.Content>
      </Popover>
    )
  }

  //add backlog open
  add_backlog_open(){
    this.setState({
      add_backlog_modal:true,
      add_backlog_requirement:{display:'none'},
      add_backlog_issue:{display:'none'},
      add_backlog_requirement_disabled:true,
      add_backlog_filter:[],
      add_backlog_team:[],
      add_backlog_disabled:true,
    })
  }

  //add backlog modal
  add_backlog_modal(){
    const changeType = (type) => {
      this.setState({add_backlog_disabled:false})
      if (type === "0") {
        this.setState({
          add_backlog_requirement:{display:'block'},
          add_backlog_issue:{display:'none'},
        })
      } else if (type === "1") {
        this.setState({
          add_backlog_requirement:{display:'none'},
          add_backlog_issue:{display:'block'},
        })
      }
    }
    const changeModule = (id) => {
      if (id !== '') {
        let filter = this.state.requirement.filter(function(item){ return item.module_id === id })
        this.setState({
          add_backlog_filter:filter,
          add_backlog_requirement_disabled:false
        })
      }
    }
    let leader = this.state.leader
    let team = []
    this.state.employee.forEach(function(item){
      if (item._id !== leader) {
        team.push({value:item._id,label:item.name+' ('+item.division[0]['name']+')'})
      }
    })
    return (
      <Modal
        centered
        size="lg"
        backdrop="static"
        keyboard={false}
        show={this.state.add_backlog_modal}
        onHide={()=>this.setState({add_backlog_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Backlog</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Control as="select" id="backlog_type" onChange={(e)=>changeType(e.target.value)}>
                <option value="" hidden>Select Type</option>
                <option value="0">Requirement</option>
                <option value="1">Issue</option>
              </Form.Control>
            </Form.Group>
            <div className="type-requirement" style={this.state.add_backlog_requirement}>
              <Form.Group>
                <Form.Label>Module</Form.Label>
                <Form.Control as="select" onChange={(e)=>changeModule(e.target.value)}>
                  <option value="" hidden>Select Module</option>
                  {this.state.module.map((item,index) => {
                    return <option value={item.id} key={index}>{item.name}</option>
                  })}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Requirement</Form.Label>
                <Form.Control as="select" id="backlog_requirement" disabled={this.state.add_backlog_requirement_disabled}>
                  <option value="" hidden>Select Requirement</option>
                  {this.state.add_backlog_filter.map((item,index) => {
                    return <option value={item.id+'_'+item.name} key={index}>{item.name}</option>
                  })}
                </Form.Control>
                <div id="backlog_frequirement" className="invalid-feedback d-block"/>
              </Form.Group>
            </div>
            <div className="type-issue" style={this.state.add_backlog_issue}>
              <Form.Group>
                <Form.Label>Issue</Form.Label>
                <Form.Control as="select" id="backlog_issue">
                  <option value="" hidden>Select Issue</option>
                  {this.state.issue.map((item,index) => {
                    return <option value={item.id+'_'+item.name} key={index}>{item.name}</option>
                  })}
                </Form.Control>
                <div id="backlog_fissue" className="invalid-feedback d-block"/>
              </Form.Group>
            </div>
            <Form.Group>
              <Form.Label>Team</Form.Label>
              <Select
                isMulti options={team} isDisabled={this.state.add_backlog_disabled}
                className="basic-multi-select" classNamePrefix="select"
                onChange={(e)=>this.setState({add_backlog_team:e})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={this.state.add_backlog_disabled}
            onClick={()=>this.add_backlog_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //add backlog handler
  add_backlog_handler(){
    let field = null
    let feedback = null
    if (document.getElementById('backlog_type').value === '0') {
      field = document.getElementById('backlog_requirement')
      feedback = document.getElementById('backlog_frequirement')
      if (field.value === '') {
        field.className = 'form-control is-invalid'
        feedback.innerHTML = 'this field cannot be empty'
      } else {
        field.className = 'form-control is-valid'
        feedback.innerHTML = ''
        this.add_task_requirement()
      }
    } else if (document.getElementById('backlog_type').value === '1') {
      field = document.getElementById('backlog_issue')
      feedback = document.getElementById('backlog_fissue')
      if (field.value === '') {
        field.className = 'form-control is-invalid'
        feedback.innerHTML = 'this field cannot be empty'
      } else {
        field.className = 'form-control is-valid'
        feedback.innerHTML = ''
        this.add_task_issue()
      }
    } 
  }

  //add task requirement
  add_task_requirement(){
    const value = (id) => { return document.getElementById(id).value }
    const fetch = (query) => { return this.fetch({query:query}) }
    const objectId = () => { return this.props.objectId() }
    const update = (data,type) => { return this.props.collaborator_update(data,type) }
    let project_id = this.state.project_id
    let task_id = objectId()
    let employee = this.state.employee
    let pushCollaborator = []
    let pushActivity = []
    //state
    let temp = []
    this.state.add_backlog_team.forEach(function(item){
      temp.push({
        id:item.value,
        name:item.label.split('(')[0],
        division:item.label.split('(')[1].split(')')[0]
      })
    })
    this.setState({
      backlog:[...this.state.backlog,{
        id:task_id,
        task:value('backlog_requirement').split('_')[1],
        task_id:value('backlog_requirement').split('_')[0],
        type:type_0,
        team:temp.length,
        data:temp,
      }],
      add_backlog_modal:false,
    })
    NotificationManager.success(success)
    //task
    fetch(`mutation {
      task_add(
        _id:"`+task_id+`",
        project:"`+project_id+`",
        requirement:"`+value('backlog_requirement').split('_')[0]+`",
        issue:"",
        sprint:"",
        status:"0",
      ){_id}
    }`)
    //team
    this.state.add_backlog_team.forEach(function(item){
      fetch(`mutation {
        team_add(
          _id:"`+objectId()+`",
          employee:"`+item.value+`",
          task:"`+task_id+`"
        ){_id}
      }`)
    })
    //invite
    let exist = this.state.collaborator
    let invite = this.state.add_backlog_team
    exist.forEach(function(collaborator){
      invite.forEach(function(team,index){
        if (team.value === collaborator.id) { invite.splice(index,1) }
      })
    })
    invite.forEach(function(item){
      let data = employee.filter(function(filter){ return filter._id === item.value });
      let collaborator_id = objectId()
      let collaborator = {}
      collaborator.id = data[0]['_id']
      collaborator.name = data[0]['name']
      collaborator.email = data[0]['email']
      collaborator.contact = data[0]['contact']
      collaborator.division_id = data[0]['division'][0]['_id']
      collaborator.division_name = data[0]['division'][0]['name']
      collaborator.collaborator = collaborator_id
      pushCollaborator.push(collaborator)
      fetch(`mutation {
        collaborator_add(
          _id:"`+collaborator_id+`",
          project:"`+project_id+`",
          employee:"`+item.value+`",
          status:"0"
        ){_id}
      }`)
      let activity_code = 'I0'
      let activity_detail = collaborator.name+'_'+collaborator.division_name
      let activity_date = new Date()
      fetch(`mutation {
        activity_add(
          _id:"`+objectId()+`",
          project:"`+project_id+`",
          code:"`+activity_code+`",
          detail:"`+activity_detail+`",
          date:"`+activity_date+`"
        ){_id}
      }`)
      pushActivity.push({code:activity_code,detail:activity_detail,date:String(activity_date)})
      NotificationManager.info(collaborator.name+' from '+collaborator.division_name+' division is invited to this project')
    })
    update(pushCollaborator,'addArray')
    //activity
    let activity_code = 'B0'
    let activity_detail = value('backlog_requirement').split('_')[1]
    let activity_date = new Date()
    fetch(`mutation {
      activity_add(
        _id:"`+objectId()+`",
        project:"`+project_id+`",
        code:"`+activity_code+`",
        detail:"`+activity_detail+`",
        date:"`+activity_date+`"
      ){_id}
    }`)
    pushActivity.push({code:activity_code,detail:activity_detail,date:String(activity_date)})
    update(pushActivity,'addActivity')
  }

  //add task issue
  add_task_issue(){
    const value = (id) => { return document.getElementById(id).value }
    const fetch = (query) => { return this.fetch({query:query}) }
    const objectId = () => { return this.props.objectId() }
    const update = (data,type) => { return this.props.collaborator_update(data,type) }
    let project_id = this.state.project_id
    let task_id = objectId()
    let employee = this.state.employee
    let pushCollaborator = []
    let pushActivity = []
    //state
    let temp = []
    this.state.add_backlog_team.forEach(function(item){
      temp.push({
        id:item.value,
        name:item.label.split('(')[0],
        division:item.label.split('(')[1].split(')')[0]
      })
    })
    this.setState({
      backlog:[...this.state.backlog,{
        id:task_id,
        task:value('backlog_issue').split('_')[1],
        task_id:value('backlog_issue').split('_')[0],
        type:type_1,
        team:temp.length,
        data:temp,
      }],
      add_backlog_modal:false,
    })
    NotificationManager.success(success)
    //task
    fetch(`mutation {
      task_add(
        _id:"`+task_id+`",
        project:"`+project_id+`",
        requirement:"",
        issue:"`+value('backlog_issue').split('_')[0]+`",
        sprint:"",
        status:"0",
      ){_id}
    }`)
    //team
    this.state.add_backlog_team.forEach(function(item){
      fetch(`mutation {
        team_add(
          _id:"`+objectId()+`",
          employee:"`+item.value+`",
          task:"`+task_id+`"
        ){_id}
      }`)
    })
    //invite
    let exist = this.state.collaborator
    let invite = this.state.add_backlog_team
    exist.forEach(function(collaborator){
      invite.forEach(function(team,index){
        if (team.value === collaborator.id) { invite.splice(index,1) }
      })
    })
    invite.forEach(function(item){
      let data = employee.filter(function(filter){ return filter._id === item.value });
      let collaborator_id = objectId()
      let collaborator = {}
      collaborator.id = data[0]['_id']
      collaborator.name = data[0]['name']
      collaborator.email = data[0]['email']
      collaborator.contact = data[0]['contact']
      collaborator.division_id = data[0]['division'][0]['_id']
      collaborator.division_name = data[0]['division'][0]['name']
      collaborator.collaborator = collaborator_id
      pushCollaborator.push(collaborator)
      fetch(`mutation {
        collaborator_add(
          _id:"`+collaborator_id+`",
          project:"`+project_id+`",
          employee:"`+item.value+`",
          status:"0"
        ){_id}
      }`)
      let activity_code = 'I0'
      let activity_detail = collaborator.name+'_'+collaborator.division_name
      let activity_date = new Date()
      fetch(`mutation {
        activity_add(
          _id:"`+objectId()+`",
          project:"`+project_id+`",
          code:"`+activity_code+`",
          detail:"`+activity_detail+`",
          date:"`+activity_date+`"
        ){_id}
      }`)
      pushActivity.push({code:activity_code,detail:activity_detail,date:String(activity_date)})
      NotificationManager.info(collaborator.name+' from '+collaborator.division_name+' division is invited to this project')
    })
    update(pushCollaborator,'addArray')
    //activity
    let activity_code = 'B0'
    let activity_detail = value('backlog_issue').split('_')[1]
    let activity_date = new Date()
    fetch(`mutation {
      activity_add(
        _id:"`+objectId()+`",
        project:"`+project_id+`",
        code:"`+activity_code+`",
        detail:"`+activity_detail+`",
        date:"`+activity_date+`"
      ){_id}
    }`)
    pushActivity.push({code:activity_code,detail:activity_detail,date:String(activity_date)})
    update(pushActivity,'addActivity')
  }

  //table backlog
  table_backlog = [
    {
      cell: (row) => <a href="#!" onClick={()=>{this.table_handler(row.id)}}><HelpCircle size={22}/></a>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {name:'Backlog',selector:'task',sortable:true},
    {name:'Type',selector:'type',sortable:true,width:'10%'},
    {name:'Team',selector:'team',sortable:true,width:'10%'},
  ]

  //table handler
  table_handler(id){
    console.log(id)
  }

  //render
  render(){
    return (
      <div>
        {this.add_backlog_modal()}
        <Tab.Container defaultActiveKey="TAB1">
          <Card>
            <Card.Header>
              <Row>
                <Col>
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="TAB1">Backlog</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="TAB2">Sprint</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col className="text-right">
                  {localStorage.getItem('leader') === '1' &&
                    <OverlayTrigger trigger="click" placement="left" rootClose overlay={this.menu_add()} ref='overlay'>
                      <Button
                        size="sm"
                        variant="outline-dark"
                        disabled={this.state.header_button}
                      >
                        Add
                      </Button>
                    </OverlayTrigger>
                    
                  }
                  <span style={{paddingRight:15}}/>
                  <Button
                    size="sm"
                    variant="outline-dark"
                    disabled={this.state.header_button}
                    onClick={()=>this.reload()}
                  >
                    <RefreshCcw size={15} style={{marginBottom:2}}/>
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Tab.Content>
              <Tab.Pane eventKey="TAB1">
                <LayoutTable
                  noHeader={true}
                  loading={this.state.data_loading}
                  columns={this.table_backlog}
                  data={this.state.backlog}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="TAB2">
                
              </Tab.Pane>
            </Tab.Content>
          </Card>
        </Tab.Container>
      </div>
    )
  }

}