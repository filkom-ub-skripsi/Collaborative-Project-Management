import React from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import { FileText, Box, Activity, Settings, Users, AlertCircle, Trello } from 'react-feather'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentOverview from '../../component/content/loggedin/detailproject/Overview'
import ContentModule from '../../component/content/loggedin/detailproject/Module'
import ContentModuleProgress from '../../component/content/loggedin/detailproject/ModuleProgress'
import ContentScrum from '../../component/content/loggedin/detailproject/Scrum'
import ContentIssue from '../../component/content/loggedin/detailproject/Issue'
import ContentCollaborator from '../../component/content/loggedin/detailproject/Collaborator'
import ContentActivity from '../../component/content/loggedin/detailproject/Activity'
import ContentSetting from '../../component/content/loggedin/detailproject/Setting'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'},
]

export default class ViewDetailProject extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.match.params.id,breadcrumb:breadcrumb,
      overview:[{code:null,name:null,client:null,client_id:null,start:null,end:null}],
      status:null,progress:'...%',requirement:[],issue:[],employee:[],activity:[],
    }
    this.overview_update = this.overview_update.bind(this)
    this.moduleProgress_update = this.moduleProgress_update.bind(this)
    this.issue_update = this.issue_update.bind(this)
    this.collaborator_update = this.collaborator_update.bind(this)
    this.activity_update = this.activity_update.bind(this)
    this.activity_add = this.activity_add.bind(this)
    this.start = this.start.bind(this)
    this.edit = this.edit.bind(this)
  }

  //component did mount
  componentDidMount(){
    document.title = 'Loading...'
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //start
  start(){
    this.fetch({query:`
      mutation {
        project_status(
          _id:"`+this.state.project_id+`",
          status:"1"
        ){_id}
      }`
    })
    this.setState({status:'1'})
  }

  //edit
  edit(code,name,client,start,end){
    this.fetch({query:`mutation {
      project_edit(
        _id:"`+this.state.project_id+`",
        code:"`+code+`",
        name:"`+name+`",
        client:"`+client+`",
        start:"`+start+`",
        end:"`+end+`"
      )
      {
        client {
          name
        }
      }
    }`}).then(result => {
      this.setState({
        breadcrumb:[...breadcrumb,{name:name,link:'/detail-project/'+this.state.project_id}],
        overview:[{code:code,name:name,client:result.data.project_edit.client[0]['name'],client_id:client,start:start,end:end}],
      })
    })
  }

  //overview update
  overview_update(code,name,client,client_id,start,end,status){
    document.title = name
    this.setState({
      overview:[{
        code:code,
        name:name,
        client:client,
        client_id:client_id,
        start:start,
        end:end
      }],
      breadcrumb: [...breadcrumb,{
        name:name,
        link:'/detail-project/'+this.state.project_id
      }],
      status:status
    })
  }

  //overview tab
  overview_tab(){
    return (
      <ContentOverview
        webservice={this.props.webservice}
        objectId={this.props.objectId}
        id={this.state.project_id}
        update={this.overview_update}
        status={this.state.status}
        progress={this.state.progress}
        data={this.state.overview}
        activity={this.activity_add}
      />
    )
  }

  //module tab
  module_tab(){
    return (
      <ContentModule
        webservice={this.props.webservice}
        objectId={this.props.objectId}
        id={this.state.project_id}
        activity={this.activity_add}
      />
    )
  }

  //module progress update
  moduleProgress_update(data){
    var done = 0
    data.forEach(function(module){
      var finished = module.requirement.filter(function(item){ return item.status === '1' })
      if (module.requirement.length === finished.length) { done++ }
    })
    var progress = Math.round(done/data.length*100)
    this.setState({progress:progress+'%',requirement:data})
  }

  //module progress tab
  moduleProgress_tab(){
    return (
      <ContentModuleProgress
        webservice={this.props.webservice}
        id={this.state.project_id}
        update={this.moduleProgress_update}
      />
    )
  }

  //scrum tab
  scrum_tab(){
    return (
      <ContentScrum
        webservice={this.props.webservice}
        id={this.state.project_id}
        requirement={this.state.requirement}
        issue={this.state.issue}
        employee={this.state.employee}
        activity={this.activity_add}
      />
    )
  }

  //issue update
  issue_update(data){
    this.setState({issue:data})
  }

  //issue tab
  issue_tab(){
    return (
      <ContentIssue
        webservice={this.props.webservice}
        objectId={this.props.objectId}
        id={this.state.project_id}
        requirement={this.state.requirement}
        update={this.issue_update}
        activity={this.activity_add}
      />
    )
  }

  //collaborator update
  collaborator_update(data){
    this.setState({employee:data})
  }

  //collaborator tab
  collaborator_tab(){
    return (
      <ContentCollaborator
        webservice={this.props.webservice}
        objectId={this.props.objectId}
        id={this.state.project_id}
        update={this.collaborator_update}
        activity={this.activity_add}
      />
    )
  }

  //activity update
  activity_update(activity){
    this.setState({activity:activity})
  }

  //activity add
  activity_add(code,detail,date){
    this.setState({
      activity: [...this.state.activity,{
        code:code,
        detail:detail,
        date:String(date),
      }]
    })
  }

  //tab setting
  setting_tab(){
    return (
      <ContentSetting
        webservice={this.props.webservice}
        objectId={this.props.objectId}
        hashMD5={this.props.hashMD5}
        id={this.state.project_id}
        status={this.state.status}
        data={this.state.overview}
        activity={this.activity_add}
        start={this.start}
        edit={this.edit}
      />
    )
  }
  
  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>
          <Tabs defaultActiveKey="TAB1">
            <Tab eventKey="TAB1" title={<FileText/>}>{this.overview_tab()}</Tab>
            {this.state.status !== null &&
              <Tab eventKey="TAB2" title={<Box/>}>
                {this.state.status === '0' && this.module_tab()}
                {this.state.status === '1' && this.moduleProgress_tab()}
              </Tab>
            }
            {this.state.status === '1' &&
              <Tab eventKey="TAB3" title={<Trello/>}><div>{this.scrum_tab()}</div></Tab>
            }
            {this.state.status === '1' &&
              <Tab eventKey="TAB4" title={<AlertCircle/>}>{this.issue_tab()}</Tab>
            }
            {this.state.status === '1' &&
              <Tab eventKey="TAB5" title={<Users/>}>{this.collaborator_tab()}</Tab>
            }
            <Tab eventKey="TAB6" title={<Activity/>}>
              <ContentActivity
                webservice={this.props.webservice}
                id={this.state.project_id}
                update={this.activity_update}
                data={this.state.activity}
              />
            </Tab>
            {localStorage.getItem('leader') === '1' &&
              <Tab eventKey="TAB7" title={<Settings/>}>{this.setting_tab()}</Tab>
            }
          </Tabs>
        </Container>
      </div>
    )
  }

}