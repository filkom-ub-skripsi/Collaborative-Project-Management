import React from 'react'
import Select from 'react-select'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Tab, Card, Nav, Row, Col, Button, OverlayTrigger, Popover, Modal, Form } from 'react-bootstrap'
import { RefreshCcw, HelpCircle, XCircle } from 'react-feather'
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
      detail_modal:false,detail_employee:[],
      detail_id:null,detail_header:null,detail_data:[]
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
          team { _id, employee { _id, name, division { name } } }
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
              division:team.employee[0]['division'][0]['name'],
              team:team._id
            })
          })
          if (item.requirement.length !== 0){
            backlog.push({
              id:item._id+'_'+0,
              task:item.requirement[0]['name'],
              task_id:item.requirement[0]['_id'],
              type:type_0,
              team:item.team.length,
              data:data,
            })
          } else if (item.issue.length !== 0) {
            backlog.push({
              id:item._id+'_'+0,
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
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.detail_modal}
        onHide={()=>this.setState({detail_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.detail_header}</Modal.Title>
        </Modal.Header>
        {localStorage.getItem('leader') === '1' &&
          <Modal.Body>
            <Form autoComplete="off">
              <Form.Row>
                <Col lg={11}>
                  <Form.Control as="select" id="tambah_teamMember">
                    <option value="" hidden>Add Team Member</option>
                    {this.state.detail_employee.map((item,index) => {
                      return <option value={item.id} key={index}>{item.name}</option>
                    })}
                  </Form.Control>
                </Col>
                <Col lg={1}>
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

  //render
  render(){
    return (
      <div>
        {this.add_backlog_modal()}
        {this.detail_modal()}
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