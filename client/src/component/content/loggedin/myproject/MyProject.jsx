import React from 'react'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { Row, Col, Button, Modal, Form, ProgressBar } from 'react-bootstrap'
import { RefreshCcw, HelpCircle } from 'react-feather'
import { createApolloFetch } from 'apollo-fetch'
import StepWizard from 'react-step-wizard'
import LayoutCardContent  from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'

//fetch
const fetch = createApolloFetch({
  uri: 'http://localhost:4000/graphql',
})

//notification
const notification = 'Your changes have been successfully saved'

//misc
const bulan = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const transition = {enterRight:'',enterLeft:'',exitRight:'',exitLeft :''}

//class
export default class ContentMyProject extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      header_button:true,
      data:[],data_client:[],data_loading:true,
      add_project_modal:false,add_form_progress:0,
      add_form_code:'',add_form_name:'',add_form_client:'',add_form_start:'',add_form_end:'',
      add_form_problem:'',add_form_goal:'',add_form_objective:'',add_form_success:'',
    }
    this.handler_1 = this.handler_1.bind(this)
    this.handler_2 = this.handler_2.bind(this)
    this.handler_3 = this.handler_3.bind(this)
    this.handler_4 = this.handler_4.bind(this)
    this.handler_5 = this.handler_5.bind(this)
    this.handler_6 = this.handler_6.bind(this)
    this.handler_back = this.handler_back.bind(this)
    this.handler_save = this.handler_save.bind(this)
    this.push()
  }

  //push
  push(){
    fetch({
      query:`{
        organization(_id:"`+localStorage.getItem('organization')+`") {
          project {
            _id,
            code,
            name,
            status,
            start,
            end,
            client {
              name
            },
            employee {
              _id
            },
            module {
              requirement {
                status
              }
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.project
      var counter = 0
      temp.forEach(function(item_project,index_project){
        if (item_project.employee[0]['_id'] === localStorage.getItem('user')) {  
          var start = new Date(item_project.start);var end = new Date(item_project.end)
          var start_text = start.getDate()+' '+bulan[start.getMonth()]+', '+start.getFullYear()
          var end_text = end.getDate()+' '+bulan[end.getMonth()]+', '+end.getFullYear()
          var status = null
          if (item_project.status === '0') { status = 'Preparing' }
          else if (item_project.status === '2') { status = 'Finished' }
          else if (item_project.status === '1') {
            item_project.module.forEach(function(item_progress,index_progress){
              var all = temp[index_project].module[index_progress]['requirement'].length
              var done = item_progress.requirement.filter(function(search){ return search.status === '1' })
              if (all === done.length) { counter++ }
            })
            var progress = Math.round(counter/temp[index_project].module.length*100)+'%'
            status = 'On Progress ('+progress+')'
          }     
          data.push({
            id:item_project._id,
            project:'['+item_project.code+'] '+item_project.name,
            client:item_project.client[0]['name'],
            date:start_text+' - '+end_text,
            progress:status
          })
          counter = 0
        }
      })
      this.setState({
        data:data,
        data_loading:false,
        header_button:false
      })
    })
    fetch({
      query:`{
        organization(_id:"`+localStorage.getItem('organization')+`") {
          client {
            _id,
            name
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.client
      temp.forEach(function(item){
        data.push({
          value:item._id,
          label:item.name
        })
      })
      this.setState({data_client:data})
    })
  }
  
  //reload
  reload(){
    this.setState({
      data_loading:true,
      header_button:true
    })
    this.push()
  }

  //replace \n
  insert_replace(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'\\n')
  }

  //add project modal
  add_project_modal(){
    return (
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_project_modal}
        onHide={()=>this.add_project_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{paddingTop:15}}/>
          <ProgressBar now={this.state.add_form_progress}/>
        </Modal.Body>
        <StepWizard isHashEnabled={true} transitions={transition}>
          <this.AddProject1
            data={this.state.data_client}
            handler={this.handler_1}
            back={this.handler_back}
            save={this.handler_save}
          />
          <this.AddProject2 handler={this.handler_2} back={this.handler_back}/>
          <this.AddProject3 handler={this.handler_3} back={this.handler_back}/>
          <this.AddProject4 handler={this.handler_4} back={this.handler_back}/>
          <this.AddProject5 handler={this.handler_5} back={this.handler_back}/>
          <this.AddProject6 handler={this.handler_6} back={this.handler_back}/>
        </StepWizard>
      </Modal>
    )
  }

  //add project close
  add_project_close(){
    this.setState({
      add_project_modal:false,add_form_progress:0,
      add_form_code:'',add_form_name:'',add_form_client:'',add_form_start:'',add_form_end:'',
      add_form_problem:'',add_form_goal:'',add_form_objective:'',add_form_success:'',add_form_obstacle:'',
    })
    window.location.hash = ""
  }

  //add project 1
  AddProject1(props){
    const validation = () => {
      var counter = 0
      const form = [
        {field:'tambah_name',feedback:'tambah_fname'},
        {field:'tambah_code',feedback:'tambah_fcode'},
        {field:'tambah_client',feedback:'tambah_fclient'},
        {field:'tambah_start',feedback:'tambah_fstart'},
        {field:'tambah_end',feedback:'tambah_fend'},
      ]
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
    const next = () => {
      if (validation() === true){
        var code = document.getElementById('tambah_code').value
        var name = document.getElementById('tambah_name').value
        var client = document.getElementById('tambah_client').value
        var start = document.getElementById('tambah_start').value
        var end = document.getElementById('tambah_end').value
        props.handler(code,name,client,start,end)
        window.location.hash = "step2"
      }
    }
    const save = () => {
      if (validation() === true) {
        Swal({
          title: "Save anyway?",
          text: "You can still fill in other blank fields later",
          icon: "warning",
          closeOnClickOutside:false,
          buttons: true,
          dangerMode: true,
        }).then((willSave) => {
          if (willSave) {
            var code = document.getElementById('tambah_code').value
            var name = document.getElementById('tambah_name').value
            var client = document.getElementById('tambah_client').value
            var start = document.getElementById('tambah_start').value
            var end = document.getElementById('tambah_end').value
            props.save(code,name,client,start,end)
          }
        })
      }
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Code</Form.Label>
              <Form.Control type="text" id="tambah_code"/>
              <div id="tambah_fcode" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Client</Form.Label>
              <Form.Control id="tambah_client" as="select" defaultValue="">
                <option value="" hidden></option>
                {props.data.map((item,index) => {
                  return ( <option value={item.value+'_'+item.label} key={index}>{item.label}</option> )
                })}
              </Form.Control>
              <div id="tambah_fclient" className="invalid-feedback d-block"/>
            </Form.Group>
            <Row>
              <Col>
                <Form.Group>
                  <Form.Label>Start</Form.Label>
                  <Form.Control type="date" id="tambah_start"/>
                  <div id="tambah_fstart" className="invalid-feedback d-block"/>
                </Form.Group>          
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>End</Form.Label>
                  <Form.Control type="date" id="tambah_end"/>
                  <div id="tambah_fend" className="invalid-feedback d-block"/>
                </Form.Group>      
              </Col>
            </Row>
          </Form>
          <div style={{paddingBottom:6}}/>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={()=>save()}
          >
            Save
          </Button>
          <Button onClick={()=>next()}>Next</Button>
        </Modal.Footer>
      </div>
    )
  }

  //add project 2
  AddProject2(props){
    const next = () => {
      var problem = document.getElementById('tambah_problem').value
      props.handler(problem)
      window.location.hash = "step3"
    }
    const back = () => {
      props.back(1)
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off" className="animated faster fadeIn">
            <Form.Group>
              <Form.Label>Problem</Form.Label>
              <Form.Control type="text" id="tambah_problem" as="textarea" rows="12"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>back()}>Back</Button>
          <Button onClick={()=>next()}>Next</Button>
        </Modal.Footer>
      </div>
    )
  }

  //add project 3
  AddProject3(props){
    const next = () => {
      var goal = document.getElementById('tambah_goal').value
      props.handler(goal)
      window.location.hash = "step4"
    }
    const back = () => {
      props.back(2)
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off" className="animated faster fadeIn">
            <Form.Group>
              <Form.Label>Goal</Form.Label>
              <Form.Control type="text" id="tambah_goal" as="textarea" rows="12"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>back()}>Back</Button>
          <Button onClick={()=>next()}>Next</Button>
        </Modal.Footer>
      </div>
    )
  }

  //add project 4
  AddProject4(props){
    const next = () => {
      var objective = document.getElementById('tambah_objective').value
      props.handler(objective)
      window.location.hash = "step5"
    }
    const back = () => {
      props.back(3)
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off" className="animated faster fadeIn">
            <Form.Group>
              <Form.Label>Objective</Form.Label>
              <Form.Control type="text" id="tambah_objective" as="textarea" rows="12"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>back()}>Back</Button>
          <Button onClick={()=>next()}>Next</Button>
        </Modal.Footer>
      </div>
    )
  }

  //add project 5
  AddProject5(props){
    const next = () => {
      var success = document.getElementById('tambah_success').value
      props.handler(success)
      window.location.hash = "step6"
    }
    const back = () => {
      props.back(4)
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off" className="animated faster fadeIn">
            <Form.Group>
              <Form.Label>Success Criteria</Form.Label>
              <Form.Control type="text" id="tambah_success" as="textarea" rows="12"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>back()}>Back</Button>
          <Button onClick={()=>next()}>Next</Button>
        </Modal.Footer>
      </div>
    )
  }

  //add project 6
  AddProject6(props){
    const next = () => {
      var obstacle = document.getElementById('tambah_obstacle').value
      props.handler(obstacle)
    }
    const back = () => {
      props.back(5)
    }
    return (
      <div>
        <Modal.Body>
          <Form autoComplete="off" className="animated faster fadeIn">
            <Form.Group>
              <Form.Label>Assumptions, Risks, Obstacles</Form.Label>
              <Form.Control type="text" id="tambah_obstacle" as="textarea" rows="12"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={()=>back()}>Back</Button>
          <Button
            onClick={()=>next()}
          >
            Save
          </Button>
        </Modal.Footer>
      </div>
    )
  }

  //handler back
  handler_back(int){
    if (int === 1) {
      window.location.hash = "step1"
      this.setState({add_form_progress:0})
    } else if (int === 2) {
      window.location.hash = "step2"
      this.setState({add_form_progress:20})
    } else if (int === 3) {
      window.location.hash = "step3"
      this.setState({add_form_progress:40})
    } else if (int === 4) {
      window.location.hash = "step4"
      this.setState({add_form_progress:60})
    } else if (int === 5) {
      window.location.hash = "step5"
      this.setState({add_form_progress:80})
    }
  }

  //handler 1
  handler_1(code,name,client,start,end){
    this.setState({
      add_form_code:code,
      add_form_name:name,
      add_form_client:client,
      add_form_start:start,
      add_form_end:end,
      add_form_progress:20
    })
  }

  //handler 2
  handler_2(problem){
    this.setState({
      add_form_problem:problem,
      add_form_progress:40
    })
  }

  //handler 3
  handler_3(goal){
    this.setState({
      add_form_goal:goal,
      add_form_progress:60
    })
  }

  //handler 4
  handler_4(objective){
    this.setState({
      add_form_objective:objective,
      add_form_progress:80
    })
  }

  //handler 5
  handler_5(success){
    this.setState({
      add_form_success:success,
      add_form_progress:100
    })
  }

  //handler 6
  handler_6(obstacle){
    if (this.handler_validation() === true) {
      var id = RDS.generate({length:32,charset:'alphabetic'})
      var start_date = new Date(this.state.add_form_start);var end_date = new Date(this.state.add_form_end)
      var start_text = start_date.getDate()+' '+bulan[start_date.getMonth()]+', '+start_date.getFullYear()
      var end_text = end_date.getDate()+' '+bulan[end_date.getMonth()]+', '+end_date.getFullYear()
      fetch({query:`
        mutation {
          project_add(
            _id:"`+id+`",
            organization:"`+localStorage.getItem('organization')+`",
            employee:"`+localStorage.getItem('user')+`",
            client:"`+this.state.add_form_client.split('_')[0]+`",
            code:"`+this.state.add_form_code+`",
            name:"`+this.state.add_form_name+`",
            start:"`+this.state.add_form_start+`",
            end:"`+this.state.add_form_end+`",
            problem:"`+this.insert_replace(this.state.add_form_problem)+`",
            goal:"`+this.insert_replace(this.state.add_form_goal)+`",
            objective:"`+this.insert_replace(this.state.add_form_objective)+`",
            success:"`+this.insert_replace(this.state.add_form_success)+`",
            obstacle:"`+this.insert_replace(obstacle)+`",
            status:"0"
          ){_id}
        }`
      })
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_date = new Date()
      fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+id+`",
            code:"P0",
            detail:"",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.setState({
        data: [...this.state.data,{
          id:id,
          project:'['+this.state.add_form_code+'] '+this.state.add_form_name,
          client:this.state.add_form_client.split('_')[1],
          date:start_text+' - '+end_text,
          progress:'Preparing'
        }] 
      })
      this.add_project_close()
      NotificationManager.success(notification)
    }
  }

  //handler save
  handler_save(code,name,client,start,end){
    this.setState({add_form_progress:100})
    var id = RDS.generate({length:32,charset:'alphabetic'})
    var start_date = new Date(start);var end_date = new Date(end)
    var start_text = start_date.getDate()+' '+bulan[start_date.getMonth()]+', '+start_date.getFullYear()
    var end_text = end_date.getDate()+' '+bulan[end_date.getMonth()]+', '+end_date.getFullYear()
    fetch({query:`
      mutation {
        project_add(
          _id:"`+id+`",
          organization:"`+localStorage.getItem('organization')+`",
          employee:"`+localStorage.getItem('user')+`",
          client:"`+client.split('_')[0]+`",
          code:"`+code+`",
          name:"`+name+`",
          start:"`+start+`",
          end:"`+end+`",
          problem:"",
          goal:"",
          objective:"",
          success:"",
          obstacle:"",
          status:"0"
        ){_id}
      }`
    })
    var activity_id = RDS.generate({length:32,charset:'alphabetic'})
    var activity_date = new Date()
    fetch({query:`
      mutation {
        activity_add(
          _id:"`+activity_id+`",
          project:"`+id+`",
          code:"P0",
          detail:"",
          date:"`+activity_date+`"
        ){_id}
      }`
    })
    this.setState({
      add_form_progress:100,
      data: [...this.state.data,{
        id:id,
        project:'['+code+'] '+name,
        client:client.split('_')[1],
        date:start_text+' - '+end_text,
        progress:'Preparing'
      }] 
    })
    this.add_project_close()
    NotificationManager.success(notification)
  }
  
  //handler validation
  handler_validation(){
    var counter = 0
    if (this.state.add_form_name !== '') { counter++ }
    if (this.state.add_form_code !== '') { counter++ }
    if (this.state.add_form_client !== '') { counter++ }
    if (this.state.add_form_start !== '') { counter++ }
    if (this.state.add_form_end !== '') { counter++ }
    if ( counter === 5 ) {
      return true
    } else {
      Swal({
        title:"Failed",
        text:"Please fill in the first form first",
        icon:"warning",
        closeOnClickOutside:false,
      })
      window.location.hash = "#step1"
    }
  }

  //table columns
  table_columns = [
    {
      cell: (row) => <Link to={"/detail-project/"+row.id}><HelpCircle size={22}/></Link>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {name:'Project',selector:'project',sortable:true},
    {name:'Client',selector:'client',sortable:true},
    {name:'Date',selector:'date',sortable:true},
    {name:'Progress',selector:'progress',sortable:true},
  ]

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Project List</b>
        </Col>
        <Col className="text-right">
          <Button
            size="sm"
            variant="outline-dark"
            disabled={this.state.header_button}
            onClick={()=>this.setState({add_project_modal:true})}
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
            <RefreshCcw size={15} style={{marginBottom:2}}/>
          </Button>
        </Col>
      </Row>
    )
  }

  //card body
  card_body(){
    return (
      <LayoutTable
        noHeader={true}
        loading={this.state.data_loading}
        columns={this.table_columns}
        data={this.state.data}
      />
    )
  }

  //render
  render() {
    return (
      <div>
        {this.add_project_modal()}
        <LayoutCardContent
          header={this.card_header()}
          body={this.card_body()}
          table={true}
        />
      </div>
    )
  }
}