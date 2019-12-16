import React from 'react'
import { Container, Tabs, Tab } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import { FileText, Box, Activity, Settings, Users, AlertCircle } from 'react-feather'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentOverview from '../../component/content/loggedin/detailproject/Overview'
import ContentModule from '../../component/content/loggedin/detailproject/Module'
import ContentModuleProgress from '../../component/content/loggedin/detailproject/ModuleProgress'
import ContentCollaborator from '../../component/content/loggedin/detailproject/Collaborator'
import ContentIssue from '../../component/content/loggedin/detailproject/Issue'
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
      status:null,progress:null,loading:true,
      myName:null,password:null,activity:[]
    }
    this.activity = this.activity.bind(this)
    this.start = this.start.bind(this)
    this.edit = this.edit.bind(this)
  }

  //component did mount
  componentDidMount(){
    document.title = 'Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    //data
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        _id, code, name, start, end, status,
        client { _id, name },
        employee { password },
        activity { code, detail, date },
        module { requirement { status } },
      }
    }`}).then(result => {
      var done = 0
      result.data.project.module.forEach(function(module){
        var finished = module.requirement.filter(function(item){ return item.status === '1' })
        if (module.requirement.length === finished.length) { done++ }
      })
      var progress = Math.round(done/result.data.project.module.length*100)
      this.setState({
        loading:false,
        activity:result.data.project.activity,
        password:result.data.project.employee[0]['password'],
        status:result.data.project.status,progress:progress+'%',
        overview:[{
          code:result.data.project.code,
          name:result.data.project.name,
          client:result.data.project.client[0]['name'],
          client_id:result.data.project.client[0]['_id'],
          start:result.data.project.start,
          end:result.data.project.end
        }],
        breadcrumb: [...breadcrumb, {
          name:result.data.project.name,
          link:'/detail-project/'+result.data.project._id
        }]
      })
      document.title = result.data.project.name
    })
    //name
    this.fetch({query:`{
      employee(_id:"`+localStorage.getItem('user')+`"){name}
    }`}).then(result => {
      this.setState({myName:result.data.employee.name})
    })
  }

  //activity
  activity(code,detail,date){
    this.setState({
      activity: [...this.state.activity,{
        code:code,
        detail:detail,
        date:String(date),
      }]
    })
  }

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

  //tab overview
  tab_overview(){
    return (
      <ContentOverview
        webservice={this.props.webservice}
        loading={this.state.loading}
        id={this.state.project_id}
        status={this.state.status}
        progress={this.state.progress}
        data={this.state.overview}
        activity={this.activity}
      />
    )
  }

  //tab module
  tab_module(){
    return (
      <ContentModule
        webservice={this.props.webservice}
        id={this.state.project_id}
        activity={this.activity}
      />
    )
  }

  //tab module progress
  tab_moduleProgress(){
    return (
      <ContentModuleProgress
        webservice={this.props.webservice}
        id={this.state.project_id}
        activity={this.activity}
      />
    )
  }

  //tab collaborator
  tab_collaborator(){
    return (
      <ContentCollaborator
        webservice={this.props.webservice}
        id={this.state.project_id}
        activity={this.activity}
      />
    )
  }

  //tab issue
  tab_issue(){
    return (
      <ContentIssue
        webservice={this.props.webservice}
        id={this.state.project_id}
        myName={this.state.myName}
        activity={this.activity}
      />
    )
  }

  //tab setting
  tab_setting(){
    return (
      <ContentSetting
        id={this.state.project_id}
        webservice={this.props.webservice}
        status={this.state.status}
        data={this.state.overview}
        pass={this.state.password}
        activity={this.activity}
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
            <Tab eventKey="TAB1" title={<FileText/>}>{this.tab_overview()}</Tab>
            {this.state.status !== null &&
              <Tab eventKey="TAB2" title={<Box/>}>
                {this.state.status === '0' && this.tab_module()}
                {this.state.status === '1' && this.tab_moduleProgress()}
              </Tab>
            }
            {this.state.status === '1' &&
              <Tab eventKey="TAB3" title={<Users/>}>{this.tab_collaborator()}</Tab>
            }
            {this.state.status === '1' &&
              <Tab eventKey="TAB4" title={<AlertCircle/>}>{this.tab_issue()}</Tab>
            }
            <Tab eventKey="TAB5" title={<Activity/>}>
              <ContentActivity data={this.state.activity}/>
            </Tab>
            {localStorage.getItem('leader') === '1' &&
              <Tab eventKey="TAB6" title={<Settings/>}>{this.tab_setting()}</Tab>
            }
          </Tabs>
        </Container>
      </div>
    )
  }

}