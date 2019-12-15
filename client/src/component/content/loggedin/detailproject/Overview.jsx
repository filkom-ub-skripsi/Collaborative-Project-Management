import React from 'react'
import RDS from 'randomstring'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { FileText } from 'react-feather'
import { Row, Col, Button, Spinner, Modal, Form, ListGroup } from 'react-bootstrap'
import LayoutCardContent from '../../../layout/CardContent'

//misc
const spinner = <Spinner animation="border" size="sm"/>
const prewrap = { whiteSpace:'pre-wrap' }
const header = { fontWeight:500, fontSize:20 }
const title = { fontWeight:500, fontSize:16 }

//notification
const success = 'Your changes have been successfully saved'

export default class ContentOverview extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,header_button:true,loading:props.loading,
      code:this.props.data[0]['code'],name:this.props.data[0]['name'],client:this.props.data[0]['client'],start:this.props.data[0]['start'],end:this.props.data[0]['end'],
      problem:spinner,goal:spinner,objective:spinner,success:spinner,obstacle:spinner,
      status:props.status,status_text:'',progress:props.progress,update_project_modal:false,
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //component will receive props
  UNSAFE_componentWillReceiveProps(props){
    this.setState({
      status:props.status,progress:props.progress,loading:props.loading,
      code:props.data[0]['code'],name:props.data[0]['name'],client:props.data[0]['client'],start:props.data[0]['start'],end:props.data[0]['end'],
    })
    if (props.status === '0') { this.setState({status_text:'Status : Preparing '}) }
    else if (props.status === '1') { this.setState({status_text:'Status : On Progress '}) }
    else if (props.status === '2') { this.setState({status_text:'Status : Closed '}) }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        problem,
        goal,
        objective,
        success,
        obstacle
      }
    }`}).then(result => {
      var data = result.data.project
      this.setState({
        problem:data.problem,goal:data.goal,objective:data.objective,success:data.success,obstacle:data.obstacle,
        header_button:false,
      })
    })
  }

  //update project modal
  update_project_modal(){
    return (
      <Modal
        size="xl"
        backdrop="static"
        keyboard={false}
        show={this.state.update_project_modal}
        onHide={()=>this.setState({update_project_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Project Overview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Problem</Form.Label>
              <Form.Control type="text" as="textarea" rows="7" id="update_problem" defaultValue={this.state.problem}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Goal</Form.Label>
              <Form.Control type="text" as="textarea" rows="7" id="update_goal" defaultValue={this.state.goal}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Objective</Form.Label>
              <Form.Control type="text" as="textarea" rows="7" id="update_objective" defaultValue={this.state.objective}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Success Criteria</Form.Label>
              <Form.Control type="text" as="textarea" rows="7" id="update_success" defaultValue={this.state.success}/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Assumptions, Risks, Obstacles</Form.Label>
              <Form.Control type="text" as="textarea" rows="7" id="update_obstacle" defaultValue={this.state.obstacle}/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.update_project()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //replace \n
  insert_replace(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'\\n')
  }

  //update project
  update_project(){
    const value = (id) => { return document.getElementById(id).value }
    this.fetch({query:`
      mutation {
        project_update(
          _id:"`+this.state.project_id+`",
          problem:"`+this.insert_replace(value('update_problem'))+`",
          goal:"`+this.insert_replace(value('update_goal'))+`",
          objective:"`+this.insert_replace(value('update_objective'))+`",
          success:"`+this.insert_replace(value('update_success'))+`",
          obstacle:"`+this.insert_replace(value('update_obstacle'))+`"
        ){_id}
      }`
    })
    var activity_id = RDS.generate({length:32,charset:'alphabetic'})
    var activity_code = 'P1'
    var activity_date = new Date()
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
    this.setState({
      problem:value('update_problem'),
      goal:value('update_goal'),
      objective:value('update_objective'),
      success:value('update_success'),
      obstacle:value('update_obstacle'),
      update_project_modal:false
    })
    NotificationManager.success(success)
  }

  //date reformatter
  date_reformatter(date){
    var month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var old_format = new Date(date);
    var new_format = old_format.getDate()+' '+month[old_format.getMonth()]+', '+old_format.getFullYear()
    return new_format
  }

  //card header
  card_header(){
    var disabled = true
    if (
      this.state.header_button === false &&
      this.state.loading === false
    ) { disabled = false }
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Project Overview</b>
        </Col>
        <Col className="text-right">
          {this.state.status === '0' &&
            <Button
              size="sm"
              variant="outline-dark"
              disabled={disabled}
              onClick={()=>this.setState({update_project_modal:true})}
            >
              Update
            </Button>
          }
          <span style={{paddingRight:15}}/>
          <Link
            to={"/document/"+this.state.project_id}
            className="btn btn-sm btn-outline-dark"
          >
            <FileText size={15} style={{marginBottom:2}}/>
          </Link>
        </Col>
      </Row>
    )
  }

  //card body
  card_body(){
    var loading = null
    var loaded = null
    if (this.state.loading === true) {
      loading = 'block'
      loaded = 'none'
    } else {
      loading = 'none'
      loaded = 'block'
    }
    return (
      <div className="container-detail-project">
        <ListGroup variant="flush">
          <ListGroup.Item style={{display:loading}}>
            <div style={header}>Loading...</div>
          </ListGroup.Item>
          <ListGroup.Item style={{display:loaded}}>
            <div style={header}>{this.state.name+' ['+this.state.code+']'}</div>
            <div style={header}>{this.state.client}</div>
            <div style={header}>{this.date_reformatter(this.state.start)+' - '+this.date_reformatter(this.state.end)}</div>
            <div style={header}>{this.state.status_text} {this.state.status === '1' && this.state.progress}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div style={title}>Problem</div>
            <div style={prewrap}>{this.state.problem}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div style={title}>Goal</div>
            <div style={prewrap}>{this.state.goal}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div style={title}>Objective</div>
            <div style={prewrap}>{this.state.objective}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div style={title}>Success Criteria</div>
            <div style={prewrap}>{this.state.success}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div style={title}>Assumptions, Risks, Obstacles</div>
            <div style={prewrap}>{this.state.obstacle}</div>
          </ListGroup.Item>
        </ListGroup>
      </div>
    )
  }

  //render
  render() {
    return (
      <div>
        {this.update_project_modal()}
        <LayoutCardContent
          header={this.card_header()}
          body={this.card_body()}
          table={true}
        />
      </div>
    )
  }
  
}