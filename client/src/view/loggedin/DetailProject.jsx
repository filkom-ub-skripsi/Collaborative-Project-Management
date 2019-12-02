import React from 'react'
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentOverview from '../../component/content/loggedin/detailproject/Overview'
import ContentModule from '../../component/content/loggedin/detailproject/Module'
import ContentActivity from '../../component/content/loggedin/detailproject/Activity'
import ContentSetting from '../../component/content/loggedin/detailproject/Setting'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'My Projects',link:'/my-projects'},
]

export default class ViewDetailProject extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      breadcrumb:breadcrumb,
      overview:[{code:'',name:'',client:'',client_id:'',start:'',end:''}],
      loading:'block',header:'none',password:'',status:'',
      activity:[]
    }
    this.activity = this.activity.bind(this)
    this.start = this.start.bind(this)
    this.edit = this.edit.bind(this)
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({
      query:`{
        project(_id:"`+this.props.match.params.id+`") {
          code,
          name,
          client {
            _id,
            name
          },
          start,
          end,
          status,
          employee {
            password
          },
          activity {
            code,
            detail,
            date
          }
        }
      }`
    }).then(result => {
      document.title = result.data.project.name
      this.setState({
        loading:'none',header:'block',activity:result.data.project.activity,
        password:result.data.project.employee[0]['password'],
        status:result.data.project.status,
        overview:[{
          code:result.data.project.code,
          name:result.data.project.name,
          client:result.data.project.client[0]['name'],
          client_id:result.data.project.client[0]['_id'],
          start:result.data.project.start,
          end:result.data.project.end,
        }],
        breadcrumb: [...breadcrumb, {
          name:result.data.project.name,
          link:'/detail-project/'+this.props.match.params.id
        }]
      })
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
          _id:"`+this.props.match.params.id+`",
          status:"1"
        ){_id}
      }`
    })
    this.setState({status:'1'})
  }

  //edit
  edit(code,name,client,start,end){
    this.fetch({query:`
      mutation {
        project_edit(
          _id:"`+this.props.match.params.id+`",
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
      }`
    }).then(result => {
      this.setState({
        breadcrumb:[
          {name:'Main',link:'#!'},
	        {name:'My Projects',link:'/my-projects'},
          {name:name,link:'/detail-project/'+this.props.match.params.id},
        ],
        overview:[{code:code,name:name,client:result.data.project_edit.client[0]['name'],client_id:client,start:start,end:end}],
      })
    })
  }
  
  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>
          <Tab.Container defaultActiveKey="TAB1">
            <Row>
              <Col lg="2" className="de_project-menu">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="TAB1">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="TAB2">Requirement</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="TAB3">Activity</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="TAB4">Setting</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col lg="10" className="de_project-content">
                <Tab.Content>
                  <Tab.Pane eventKey="TAB1">
                    <ContentOverview
                      webservice={this.props.webservice}
                      id={this.props.match.params.id}
                      status={this.state.status}
                      data={this.state.overview}
                      loading={this.state.loading}
                      header={this.state.header}
                      activity={this.activity}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="TAB2">
                    {this.state.status === '0' &&
                      <ContentModule
                        webservice={this.props.webservice}
                        id={this.props.match.params.id}
                        activity={this.activity}
                      />
                    }
                  </Tab.Pane>
                  <Tab.Pane eventKey="TAB3">
                    <ContentActivity data={this.state.activity}/>
                  </Tab.Pane>
                  <Tab.Pane eventKey="TAB4">
                    <ContentSetting
                      id={this.props.match.params.id}
                      webservice={this.props.webservice}
                      status={this.state.status}
                      data={this.state.overview}
                      pass={this.state.password}
                      activity={this.activity}
                      start={this.start}
                      edit={this.edit}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      </div>
    )
  }

}