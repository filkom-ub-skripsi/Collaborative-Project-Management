import React from 'react'
import Select from 'react-select'
import Swal from 'sweetalert'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Tab, Card, Nav, Row, Col, Button, OverlayTrigger, Popover, Modal, Form, InputGroup } from 'react-bootstrap'
import { RefreshCcw, HelpCircle, XCircle, Minus, Plus } from 'react-feather'
import LayoutTable from '../../../layout/Table'

//notification
const success = 'Your changes have been successfully saved'

//type
const type_0 = 'Requirement'
const type_1 = 'Issue'
const sprint_0 = 'Preparing'
const sprint_1 = 'Progress'
const sprint_2 = 'Done'

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
      add_backlog_modal:false,add_backlog_requirement:{display:'none'},add_backlog_issue:{display:'none'},
      add_backlog_requirement_disabled:true,add_backlog_filter:[],add_backlog_team:[],add_backlog_disabled:true,
      detail_modal:false,detail_employee:[],detail_id:null,detail_header:null,detail_data:[],
      add_sprint_modal:false,add_sprint_backlog:[],
      sprint_detail:false,sprint_id:null,sprint_status:null,sprint_header:null,sprint_data:[],sprint_option:[],
      sprint_start:false,sprint_week:1
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

  //date reformatter
  date_reformatter(date){
    let month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    let old_format = new Date(date);
    let new_format = old_format.getDate()+' '+month[old_format.getMonth()]+', '+old_format.getFullYear()
    return new_format
  }

  //date creater
  date_creater(date){
    let month = date.getMonth() + 1
      if (String(month).length === 1) { month = '0'+month }
    let day = date.getDate()
      if (String(day).length === 1) { day = '0'+day }
    return date.getFullYear()+'-'+month+'-'+day
  }

  //date counter
  date_counter(start,end){
    let count = new Date(end).getTime() - new Date(start).getTime()
    let weeks = (count / (1000*60*60*24)) / 7
    return weeks + ' Weeks'
  }

  //date checker
  date_checker(end){
    let check = new Date(end).getTime() - new Date()
    if (check > 0) { return true } else { return false }
  }

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        organization {
          leader { leader { _id } }
          employee { _id, name, contact, email, division { _id, name } } 
        }
        task {
          _id,
          sprint { _id }
          issue { _id, name }
          requirement { _id, name }
          team { _id, employee { _id, name, division { name } } }
        }
        sprint {
          _id, name, start, end,
          task { _id }
        }
      }
    }`}).then(result => {
      let employee = result.data.project.organization[0]['employee']
      let leader = result.data.project.organization[0]['leader'][0]['leader'][0]['_id']
      let backlog = []
      result.data.project.task.forEach(function(item){
        let data = []
        item.team.forEach(function(team){
          data.push({
            id:team.employee[0]['_id'],
            name:team.employee[0]['name'],
            division:team.employee[0]['division'][0]['name'],
            team:team._id
          })
        })
        let sprint = null
        if (item.sprint.length !== 0){ sprint = item.sprint[0]['_id'] }
        if (item.requirement.length !== 0){
          backlog.push({
            id:item._id+'_'+0,
            task:item.requirement[0]['name'],
            task_id:item.requirement[0]['_id'],
            type:type_0,
            team:item.team.length,
            data:data,
            sprint:sprint
          })
        } else if (item.issue.length !== 0) {
          backlog.push({
            id:item._id+'_'+0,
            task:item.issue[0]['name'],
            task_id:item.issue[0]['_id'],
            type:type_1,
            team:item.team.length,
            data:data,
            sprint:sprint
          })
        }
      })
      let sprint = []
      const date_reformatter = (date) => { return this.date_reformatter(date) }
      const date_counter = (start, end) => { return this.date_counter(start, end) }
      const date_checker = (end) => { return this.date_checker(end) }
      result.data.project.sprint.forEach(function(item){
        let date = '-'; let duration = '-'; let status = null;
        if(item.start.length === 0){ status = sprint_0 }
        else {
          date = date_reformatter(item.start)+' - '+date_reformatter(item.end)
          duration = date_counter(item.start,item.end)
          if (date_checker(item.end)) { status = sprint_1 }
          else { status = sprint_2 }
        }
        sprint.push({
          id:item._id+'_'+0,name:item.name,date:date,duration:duration,
          backlog:item.task.length,status:status
        })
      })
      this.setState({
        employee:employee,leader:leader,
        backlog:backlog,sprint:sprint,
        data_loading:false,header_button:false,
      })
      this.props.backlog_update(backlog,'update')
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
              this.sprint_open()
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
        centered size="lg" backdrop="static"
        keyboard={false} show={this.state.add_backlog_modal}
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
    let teamId = []
    let add_backlog_team = this.state.add_backlog_team
    if (add_backlog_team === null) { add_backlog_team = [] }
    add_backlog_team.forEach(function(item){
      let team = objectId()
      temp.push({
        id:item.value,
        name:item.label.split('(')[0],
        division:item.label.split('(')[1].split(')')[0],
        team:team
      })
      teamId.push(team)
    })
    this.setState({
      backlog:[...this.state.backlog,{
        id:task_id+'_'+0,
        task:value('backlog_requirement').split('_')[1],
        task_id:value('backlog_requirement').split('_')[0],
        type:type_0,
        team:temp.length,
        data:temp,
        sprint:null
      }],
      add_backlog_modal:false,
    })
    this.props.backlog_update({
      id:task_id+'_'+0,
      task:value('backlog_requirement').split('_')[1],
      task_id:value('backlog_requirement').split('_')[0],
      type:type_0,
      team:temp.length,
      data:temp,
      sprint:null
    },'add')
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
    add_backlog_team.forEach(function(item,index){
      fetch(`mutation {
        team_add(
          _id:"`+teamId[index]+`",
          employee:"`+item.value+`",
          task:"`+task_id+`"
        ){_id}
      }`)
    })
    //invite
    let exist = this.state.collaborator
    let invite = add_backlog_team
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
    let teamId = []
    let add_backlog_team = this.state.add_backlog_team
    if (add_backlog_team === null) { add_backlog_team = [] }
    add_backlog_team.forEach(function(item){
      let team = objectId()
      temp.push({
        id:item.value,
        name:item.label.split('(')[0],
        division:item.label.split('(')[1].split(')')[0],
        team:team
      })
      teamId.push(team)
    })
    this.setState({
      backlog:[...this.state.backlog,{
        id:task_id+'_'+0,
        task:value('backlog_issue').split('_')[1],
        task_id:value('backlog_issue').split('_')[0],
        type:type_1,
        team:temp.length,
        data:temp,
        sprint:null
      }],
      add_backlog_modal:false,
    })
    this.props.backlog_update({
      id:task_id+'_'+0,
      task:value('backlog_issue').split('_')[1],
      task_id:value('backlog_issue').split('_')[0],
      type:type_1,
      team:temp.length,
      data:temp,
    },'add')
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
    add_backlog_team.forEach(function(item,index){
      fetch(`mutation {
        team_add(
          _id:"`+teamId[index]+`",
          employee:"`+item.value+`",
          task:"`+task_id+`"
        ){_id}
      }`)
    })
    //invite
    let exist = this.state.collaborator
    let invite = add_backlog_team
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
    let detail = this.state.backlog.filter(function(item){ return item.id === id })
    let leader = this.state.leader
    let option = []
    this.state.employee.forEach(function(employee){
      if (employee._id !== leader) {
        let exist = 0
        detail[0]['data'].forEach(function(data){
          if (data.id === employee._id) { exist = 1 }
        })
        if (exist === 0) { option.push({id:employee._id,name:employee.name}) }
      }
    })
    this.setState({
      detail_id:detail[0]['id'],
      detail_header:detail[0]['type']+' '+detail[0]['task'],
      detail_employee:option,
      detail_data:detail[0]['data'],
      detail_modal:true,
    })
  }

  //detail modal
  detail_modal(){
    const columns_leader = [
      {
        cell: (row) => <a href="#!" onClick={()=>{this.detail_remove(row.id)}}><XCircle size={22}/></a>,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {name:'Name',selector:'name',sortable:true},
      {name:'Division',selector:'division',sortable:true,width:'25%'},
    ]
    const columns_employee = [
      {name:'Name',selector:'name',sortable:true},
      {name:'Division',selector:'division',sortable:true,width:'25%'},
    ]
    let column = []
    if (localStorage.getItem('leader') === '1'){ column = columns_leader }
    else if (localStorage.getItem('leader') === '0'){ column = columns_employee }
    return (
      <Modal
        size="lg" centered backdrop="static" keyboard={false}
        show={this.state.detail_modal} onHide={()=>this.setState({detail_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.detail_header}</Modal.Title>
        </Modal.Header>
        {localStorage.getItem('leader') === '1' &&
          <Modal.Body>
            <Form autoComplete="off">
              <Form.Row>
                <Col lg={10}>
                  <Form.Control as="select" id="tambah_teamMember">
                    <option value="" hidden>Add Team Member</option>
                    {this.state.detail_employee.map((item,index) => {
                      return <option value={item.id} key={index}>{item.name}</option>
                    })}
                  </Form.Control>
                </Col>
                <Col lg={2}>
                  <Button block
                    variant="outline-dark"
                    onClick={()=>this.detail_add()}
                  >
                    Add
                  </Button>
                </Col>
              </Form.Row>
            </Form>
          </Modal.Body>
        }
        <LayoutTable
          noHeader={true}
          columns={column}
          data={this.state.detail_data}
        />
        {localStorage.getItem('leader') === '1' &&
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={()=>this.detail_delete()}
            >
              Delete
            </Button>
          </Modal.Footer>
        }
      </Modal>
    )
  }

  //detail add
  detail_add(){
    let add = document.getElementById('tambah_teamMember').value
    if (add !== '') {
      //function
      const fetch = (query) => { return this.fetch({query:query}) }
      const state = (id) => { return this.setState({detail_id:id}) }
      const objectId = () => { return this.props.objectId() }
      //state detail
      let team = objectId()
      let push = this.state.employee.filter(function(item){ return item._id === add })
      let option = this.state.detail_employee.filter(function(item){ return item.id !== add })
      this.setState({
        detail_data:[...this.state.detail_data,{
          id:push[0]['_id'],name:push[0]['name'],division:push[0]['division'][0]['name'],team:team
        }],
        detail_employee:option
      })
      //state table
      let detail_id = this.state.detail_id
      let data = this.state.backlog
      data.forEach(function(item){
        if (item.id === detail_id) {
          let version = parseInt(item.id.split('_')[1])+1
          item.id = item.id.split('_')[0]+'_'+version
          item.team = parseInt(item.team)+1
          item.data = [...item.data,{
            id:push[0]['_id'],name:push[0]['name'],division:push[0]['division'][0]['name'],team:team
          }]
          state(item.id)
          fetch(`mutation {
            team_add(
              _id:"`+team+`",
              employee:"`+push[0]['_id']+`",
              task:"`+item.id.split('_')[0]+`",
            ){_id}
          }`)
        }
      })
      this.props.backlog_update(data,'update')
      //invite
      let invite = this.state.collaborator.filter(function(item){ return item.id === add })
      if (invite.length === 0) {
        let project_id = this.state.project_id
        //collaborator
        let collaborator_id = objectId()
        let collaborator = {}
        collaborator.id = push[0]['_id']
        collaborator.name = push[0]['name']
        collaborator.email = push[0]['email']
        collaborator.contact = push[0]['contact']
        collaborator.division_id = push[0]['division'][0]['_id']
        collaborator.division_name = push[0]['division'][0]['name']
        collaborator.collaborator = collaborator_id
        this.props.collaborator_update(collaborator,'add')
        fetch(`mutation {
          collaborator_add(
            _id:"`+collaborator_id+`",
            project:"`+project_id+`",
            employee:"`+push[0]['_id']+`",
            status:"0"
          ){_id}
        }`)
        //activity
        let activity_code = 'I0'
        let activity_detail = push[0]['name']+'_'+push[0]['division'][0]['name']
        let activity_date = new Date()
        this.props.activity(activity_code,activity_detail,activity_date)
        //notification
        NotificationManager.info(push[0]['name']+' from '+push[0]['division'][0]['name']+' division is invited to this project')
      }
      //notification
      document.getElementById('tambah_teamMember').value = ''
      NotificationManager.success(success)
    }
  }

  //detail remove
  detail_remove(id){
    Swal({
      title:"Remove",
      text:"This employee will be removed from the team",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willRemove) => {
      if (willRemove) {
        const fetch = (query) => { return this.fetch({query:query}) }
        const state = (id,data) => { return this.setState({detail_id:id,detail_data:data}) }
        let detail_id = this.state.detail_id
        let detail_employee = []
        let data = this.state.backlog
        data.forEach(function(item){
          if (item.id === detail_id) {
            let team = item.data.filter(function(item){ return item.id === id })
            let version = parseInt(item.id.split('_')[1])+1
            item.id = item.id.split('_')[0]+'_'+version
            item.team = parseInt(item.team)-1
            item.data = item.data.filter(function(item){ return item.id !== id })
            state(item.id,item.data)
            fetch(`mutation {
              team_delete(_id:"`+team[0]['team']+`"){_id}
            }`)
            detail_employee.push({id:team[0]['id'],name:team[0]['name']})
            NotificationManager.success(success)
          }
        })
        this.props.backlog_update(data,'update')
        this.setState({
          detail_employee:[
            ...this.state.detail_employee,
            detail_employee[0]
          ]
        })
        NotificationManager.success(success)
      }
    })
  }

  //detail delete
  detail_delete(){
    Swal({
      title:"Delete",
      text:"This backlog will be deleted",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        const fetch = (query) => { return this.fetch({query:query}) }
        let detail_id = this.state.detail_id
        //data
        let data = this.state.backlog.filter(function(item){ return item.id === detail_id })
        this.props.backlog_update(data[0]['id'],'delete')
        fetch(`mutation {
          task_delete(_id:"`+data[0]['id'].split('_')[0]+`"){_id}
        }`)
        data[0]['data'].forEach(function(item){
          fetch(`mutation {
            team_delete(_id:"`+item.team+`"){_id}
          }`)
        })
        //state
        let backlog = this.state.backlog.filter(function(item){ return item.id !== detail_id })
        this.setState({backlog:backlog,detail_modal:false})
        //activity
        let activity_code = 'B1'
        let activity_detail = data[0]['task']
        let activity_date = new Date()
        fetch(`mutation {
          activity_add(
            _id:"`+this.props.objectId()+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`)
        this.props.activity(activity_code,activity_detail,activity_date)
        //notification
        NotificationManager.success(success)
      }
    })
  }

  //sprint open
  sprint_open(){
    this.setState({
      add_sprint_modal:true,
      add_sprint_backlog:[]
    })
  }

  //sprint modal
  sprint_modal(){
    let backlog = []
    this.state.backlog.forEach(function(item){
      if (item.sprint === null) {
        backlog.push({value:item.task_id,label:'['+item.type+'] '+item.task})
      }
    })
    return (
      <Modal
        centered size="lg" backdrop="static"
        keyboard={false} show={this.state.add_sprint_modal}
        onHide={()=>this.setState({add_sprint_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Sprint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="sprint_name"/>
              <div id="sprint_fname" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
          <Form.Group>
            <Form.Label>Backlog</Form.Label>
            <Select
              isMulti options={backlog}
              className="basic-multi-select" classNamePrefix="select"
              onChange={(e)=>this.setState({add_sprint_backlog:e})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.sprint_add()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //sprint add
  sprint_add(){
    let field = document.getElementById('sprint_name')
    let feedback = document.getElementById('sprint_fname')
    if (field.value === '') {
      field.className = 'form-control is-invalid'
      feedback.innerHTML = 'this field cannot be empty'
    } else {
      field.className = 'form-control is-valid'
      feedback.innerHTML = ''
      const fetch = (query) => { return this.fetch({query:query}) }
      let id = this.props.objectId()
      let name = document.getElementById('sprint_name').value
      fetch(`mutation {
        sprint_add(
          _id:"`+id+`",
          project:"`+this.state.project_id+`",
          name:"`+name+`",
          start:"",
          end:""
        ){_id}
      }`)
      let backlog = this.state.backlog
      let sprint = this.state.add_sprint_backlog
      backlog.forEach(function(i_backlog){
        sprint.forEach(function(i_sprint){
          if(i_backlog.task_id === i_sprint.value){
            fetch(`mutation {
              task_assign(_id:"`+i_backlog.id.split('_')[0]+`",sprint:"`+id+`"){_id}
            }`)
            i_backlog.sprint = id
          }
        })
      })
      this.setState({
        add_sprint_modal:false,
        sprint:[...this.state.sprint,{
          id:id+'_'+0,name:name,
          date:'-',duration:'-',
          backlog:this.state.add_sprint_backlog.length,
          status:sprint_0
        }]
      })
      this.props.backlog_update(backlog,'update')
      let activity_code = 'N0'
      let activity_detail = name
      let activity_date = new Date()
      fetch(`mutation {
        activity_add(
          _id:"`+this.props.objectId()+`",
          project:"`+this.state.project_id+`",
          code:"`+activity_code+`",
          detail:"`+activity_detail+`",
          date:"`+activity_date+`"
        ){_id}
      }`)
      this.props.activity(activity_code,activity_detail,activity_date)
      NotificationManager.success(success)
    }
  }

  //sprint table
  sprint_table = [
    {
      cell: (row) => <a href="#!" onClick={()=>{this.sprint_handler(row.id)}}><HelpCircle size={22}/></a>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {name:'Name',selector:'name',sortable:true},
    {name:'Date',selector:'date',sortable:true},
    {name:'Duration',selector:'duration',sortable:true},
    {name:'Backlog',selector:'backlog',sortable:true},
    {name:'Status',selector:'status',sortable:true},
  ]

  //sprint handler
  sprint_handler(id){
    let sprint = this.state.sprint.filter(function(item){ return item.id === id })
    let backlog = this.state.backlog.filter(function(item){ return item.sprint === id.split('_')[0] })
    let option = []
    this.state.backlog.forEach(function(item){ if (item.sprint === null) { option.push({value:item.id.split('_')[0],label:'['+item.type+'] '+item.task}) } })
    this.setState({
      sprint_id:sprint[0]['id'],
      sprint_status:sprint[0]['status'],
      sprint_header:sprint[0]['name'],
      sprint_option:option,
      sprint_data:backlog,
      sprint_detail:true,
    })
  }

  //sprint detail
  sprint_detail(){
    const columns_leader = [
      {
        cell: (row) => <a href="#!" onClick={()=>{this.sprint_remove(row.id)}}><XCircle size={22}/></a>,
        ignoreRowClick: true, allowOverflow: true, button: true,
      },
      {name:'Backlog',selector:'task',sortable:true},
      {name:'Type',selector:'type',sortable:true,width:'15%'},
      {name:'Team',selector:'team',sortable:true,width:'10%'},
    ]
    const columns_employee = [
      {name:'Backlog',selector:'task',sortable:true},
      {name:'Type',selector:'type',sortable:true,width:'15%'},
      {name:'Team',selector:'team',sortable:true,width:'10%'},
    ]
    let column = []
    if (localStorage.getItem('leader') === '1' && this.state.sprint_status === sprint_0){ column = columns_leader }
    else { column = columns_employee }
    let sprint_id = this.state.sprint_id
    if (sprint_id !== null) { sprint_id = sprint_id.split('_')[0] }
    return (
      <Modal
        size="lg" centered backdrop="static" keyboard={false}
        show={this.state.sprint_detail} onHide={()=>this.setState({sprint_detail:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.sprint_header}</Modal.Title>
        </Modal.Header>
        {localStorage.getItem('leader') === '1' && this.state.sprint_status === sprint_0 &&
          <Modal.Body>
            <Form autoComplete="off" style={{paddingBottom:15}}>
              <Form.Row>
                <Col lg={10}>
                  <Form.Control type="text" id="sprint_changeName" placeholder="Change the sprint name"/>
                </Col>
                <Col lg={2}>
                  <Button
                    variant="outline-dark" block
                    onClick={()=>this.sprint_edit()}
                  >
                    Edit
                  </Button>
                </Col>
              </Form.Row>
            </Form>
            <Form autoComplete="off">
              <Form.Row>
                <Col lg={10}>
                  <Form.Control as="select" id="tambah_sprintBacklog">
                    <option value="" hidden>Add Backlog</option>
                    {this.state.sprint_option.map((item,index) => {
                      return <option value={item.value} key={index}>{item.label}</option>
                    })}
                  </Form.Control>
                </Col>
                <Col lg={2}>
                  <Button block
                    variant="outline-dark"
                    onClick={()=>this.sprint_assign()}
                  >
                    Add
                  </Button>
                </Col>
              </Form.Row>
            </Form>
          </Modal.Body>
        }
        <LayoutTable
          noHeader={true}
          columns={column}
          data={this.state.sprint_data}
        />
        {localStorage.getItem('leader') === '1' && this.state.sprint_status === sprint_0 &&
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={()=>{
                if (this.state.sprint_data.length !== 0) {
                  this.setState({sprint_detail:false,sprint_start:true})
                } else {
                  Swal({
                    title:"Not Available",text:"Sprint must contain at least one backlog",
                    icon:"warning",closeOnClickOutside:false,
                  })
                }
              }}
            >
              Start
            </Button>
            <Button
              variant="danger"
              onClick={()=>this.sprint_delete()}
            >
              Delete
            </Button>
          </Modal.Footer>
        }
        {this.state.sprint_status !== sprint_0 &&
          <Modal.Footer>
            <Link
              to={'/scrum-board/'+sprint_id}
              className="btn btn-primary"
            >
              Scrum Board
            </Link>
          </Modal.Footer>
        }
      </Modal>
    )
  }

  //sprint edit
  sprint_edit(){
    let newName = document.getElementById('sprint_changeName').value
    if (newName !== '') {
      let sprint_id = this.state.sprint_id
      this.fetch({query:`mutation {
        sprint_edit(
          _id:"`+sprint_id.split('_')[0]+`",
          name:"`+newName+`"
        ){_id}
      }`})
      let sprint = this.state.sprint
      sprint.forEach(function(item){ if (item.id.split('_')[0] === sprint_id.split('_')[0]) {
        let version = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+version
        item.name = newName
      }})
      this.setState({sprint_header:newName})
      document.getElementById('sprint_changeName').value = ''
      let activity_code = 'N1'
      let activity_detail = newName
      let activity_date = new Date()
      this.fetch({query:`mutation {
        activity_add(
          _id:"`+this.props.objectId()+`",
          project:"`+this.state.project_id+`",
          code:"`+activity_code+`",
          detail:"`+activity_detail+`",
          date:"`+activity_date+`"
        ){_id}
      }`})
      this.props.activity(activity_code,activity_detail,activity_date)
      NotificationManager.success(success)
    }
  }

  //sprint assign
  sprint_assign(){
    let assign = document.getElementById('tambah_sprintBacklog').value
    if (assign !== '') {
      let sprint_id = this.state.sprint_id
      this.fetch({query:`mutation {
        task_assign(_id:"`+assign+`",sprint:"`+sprint_id.split('_')[0]+`"){_id}
      }`})
      let backlog = this.state.backlog
      backlog.forEach(function(item){ 
        if (item.id.split('_')[0] === assign) {
          item.sprint = sprint_id.split('_')[0]
        }
      })
      this.props.backlog_update(backlog,'update')
      let sprint = this.state.sprint
      sprint.forEach(function(item){ if (item.id.split('_')[0] === sprint_id.split('_')[0]) {
        let version = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+version
        item.backlog = item.backlog + 1
      }})
      let sprint_option = this.state.sprint_option.filter(function(item){ return item.value !== assign })
      let sprint_data = this.state.backlog.filter(function(item){ return item.id.split('_')[0] === assign })
      this.setState({
        sprint_option:sprint_option,
        sprint_data:[...this.state.sprint_data,sprint_data[0]]
      })
      document.getElementById('tambah_sprintBacklog').value = ''
      NotificationManager.success(success)
    }
  }

  //sprint remove
  sprint_remove(id){
    Swal({
      title:"Remove",
      text:"This backlog will be removed from the sprint",
      icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willRemove) => {
      if (willRemove) {
        this.fetch({query:`mutation {
          task_assign(_id:"`+id.split('_')[0]+`",sprint:""){_id}
        }`})
        let option = {}
        let backlog = this.state.backlog
        backlog.forEach(function(item){ if (item.id === id) {
          option.value = item.id.split('_')[0]
          option.label = '['+item.type+'] '+item.task
          item.sprint = null
        }})
        this.props.backlog_update(backlog,'update')
        this.setState({sprint_option:[...this.state.sprint_option,option]})
        let sprint = this.state.sprint
        let sprint_id = this.state.sprint_id
        sprint.forEach(function(item){ if (item.id.split('_')[0] === sprint_id.split('_')[0]) {
          let version = parseInt(item.id.split('_')[1])+1
          item.id = item.id.split('_')[0]+'_'+version
          item.backlog = item.backlog - 1
        }})
        let sprint_data = this.state.sprint_data.filter(function(item){ return item.id !== id })
        this.setState({sprint_data:sprint_data})
        NotificationManager.success(success)
      }
    })
  }

  //sprint start
  sprint_start(){
    return (
      <Modal
        size="sm" centered backdrop="static" keyboard={false}
        show={this.state.sprint_start} onHide={()=>this.setState({sprint_start:false,sprint_week:1})}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.sprint_header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Week Duration</h6>
          <InputGroup>
            <InputGroup.Prepend>
              <Button
                size="sm"
                variant="outline-dark"
                onClick={()=>{
                  if(this.state.sprint_week !== 1) {
                    this.setState({sprint_week:this.state.sprint_week-1})
                  }
                }}
              >
                <Minus size={20}/>
              </Button>
            </InputGroup.Prepend>
            <Form.Control value={this.state.sprint_week} readOnly/>
            <InputGroup.Prepend>
              <Button
                size="sm"
                variant="outline-dark"
                onClick={()=>
                  this.setState({sprint_week:this.state.sprint_week+1})
                }
              >
                <Plus size={20}/>
              </Button>
            </InputGroup.Prepend>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.sprint_startHandler()}
          >
            Start
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //sprint start handler
  sprint_startHandler(){
    Swal({
      title:"Start",text:"This sprint will be started and cannot be undone",
      icon:"info",closeOnClickOutside:false,buttons:true,dangerMode:true,
    }).then((willStart) => {
      if (willStart) {
        let sprint_id = this.state.sprint_id
        let week = this.state.sprint_week
        let addw = week * 7
        let start = this.date_creater(new Date())
        let end = this.date_creater(new Date(new Date().setDate(new Date().getDate() + addw)))
        this.fetch({query:`mutation {
          sprint_start(
            _id:"`+sprint_id.split('_')[0]+`",
            start:"`+start+`",
            end:"`+end+`"
          ){_id}
        }`})
        let date = this.date_reformatter(start)+' - '+this.date_reformatter(end)
        let sprint = this.state.sprint
        let sprintName = null
        sprint.forEach(function(item){
          if (item.id === sprint_id) {
            let version = parseInt(item.id.split('_')[1])+1
            item.id = item.id.split('_')[0]+'_'+version
            item.date = date
            item.duration = week+' Weeks'
            item.status = sprint_1
            sprintName = item.name
          }
        })
        this.setState({
          sprint_start:false,
          sprint_week:1,
        })
        let activity_code = 'N3'
        let activity_detail = sprintName+'_'+week
        let activity_date = new Date()
        this.fetch({query:`mutation {
          activity_add(
            _id:"`+this.props.objectId()+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`})
        this.props.activity(activity_code,activity_detail,activity_date)
        NotificationManager.success(success)
      }
    })
  }

  //sprint delete
  sprint_delete(){
    if(this.state.sprint_status === sprint_0) {
      Swal({
        title:"Delete",
        text:"This sprint will be deleted",
        icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
      }).then((willDelete) => {
        if (willDelete) {
          const fetch = (query) => { return this.fetch({query:query}) }
          let sprint_id = this.state.sprint_id
          let backlog = this.state.backlog
          backlog.forEach(function(item){
            if (item.sprint === sprint_id.split('_')[0]) {
              fetch(`mutation {
                task_assign(_id:"`+item.id.split('_')[0]+`",sprint:""){_id}
              }`)
              item.sprint = null
            }
          })
          let sprint = this.state.sprint.filter(function(item){ return item.id !== sprint_id })
          this.setState({sprint:sprint,sprint_detail:false})
          fetch(`mutation {
            sprint_delete(_id:"`+sprint_id.split('_')[0]+`"){_id}
          }`)
          this.props.backlog_update(backlog,'update')
          let activity_code = 'N2'
          let activity_detail = this.state.sprint_header
          let activity_date = new Date()
          fetch(`mutation {
            activity_add(
              _id:"`+this.props.objectId()+`",
              project:"`+this.state.project_id+`",
              code:"`+activity_code+`",
              detail:"`+activity_detail+`",
              date:"`+activity_date+`"
            ){_id}
          }`)
          this.props.activity(activity_code,activity_detail,activity_date)
          NotificationManager.success(success)
        }
      })
    } else {
      Swal({
        title:"Not Available",text:"This sprint is already started or finished",
        icon:"warning",closeOnClickOutside:false,
      })
    }
  }

  //render
  render(){
    let data_backlog = this.state.backlog.filter(function(item){ return item.sprint === null })
    return (
      <div>
        {this.add_backlog_modal()}
        {this.detail_modal()}
        {this.sprint_modal()}
        {this.sprint_detail()}
        {this.sprint_start()}
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
                  data={data_backlog}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="TAB2">
                <LayoutTable
                  noHeader={true}
                  loading={this.state.data_loading}
                  columns={this.sprint_table}
                  data={this.state.sprint}
                />
              </Tab.Pane>
            </Tab.Content>
          </Card>
        </Tab.Container>
      </div>
    )
  }

}