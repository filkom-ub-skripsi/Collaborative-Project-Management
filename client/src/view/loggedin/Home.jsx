import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Container, Row, Col, Card, Jumbotron } from 'react-bootstrap'
import { Users, Trello } from 'react-feather'
import PieChart from 'react-minimal-pie-chart'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Home',link:'/'}
]

//class
export default class ViewHome extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      name:'',position:'',organization:'',show:'none',
      myProject:{preparing:0,onprogress:0,closed:0},
      client:0,division:[]
    }
  }

  //component did mount
  componentDidMount(){
    document.title = 'Home - Loading...'
    this.profile()
    this.organization()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //random rgb
  random_rgb() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
  }

  //profile
  profile(){
    this.fetch({query:`{
      employee(_id:"`+localStorage.getItem('user')+`") {
        name, division { name }, organization { name },
        project { status }, collaborator { project { status } }
      }
    }`}).then(result => {
      result = result.data.employee
      document.title = 'Home - ' + result.name
      let position = 'Leader'
      if (result.division.length !== 0){
        position = 'Member of '+result.division[0]['name']
      }
      let preparing = 
        result.project.filter(function(item){ return item.status === '0' }).length +
        result.collaborator.filter(function(item){ return item.project[0]['status'] === '0' }).length
      let onprogress = 
        result.project.filter(function(item){ return item.status === '1' }).length +
        result.collaborator.filter(function(item){ return item.project[0]['status'] === '1' }).length
      let closed = 
        result.project.filter(function(item){ return item.status === '2' }).length +
        result.collaborator.filter(function(item){ return item.project[0]['status'] === '2' }).length
      let myProject = {preparing:preparing,onprogress:onprogress,closed:closed}
      this.setState({
        name:result.name,position:position,
        organization:result.organization[0]['name'],
        show:'block',myProject:myProject
      })
    })
  }

  //organization
  organization(){
    this.fetch({query:`{
      organization(_id:"`+localStorage.getItem('organization')+`") {
        client { _id }, division {
          name, employee { _id }
        }
      }
    }`}).then(result => {
      result = result.data.organization
      const randomrgb = () => { return this.random_rgb() }
      let division = []
      result.division.forEach(function(item){
        division.push({
          title:item.name,
          value:item.employee.length,
          color:randomrgb()
        })
      })
      this.setState({
        client:result.client.length,
        division:division
      })
    })
  }

  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <Container fluid>
          <Jumbotron>
            <h1>Hello, {this.state.name}</h1>
            <h2 style={{display:this.state.show}}>
              {this.state.position} at the {this.state.organization}
            </h2>
          </Jumbotron>
          <Row>
            <Col>
              <Card>
                <Card.Header><b style={{fontSize:20}}>Projects</b></Card.Header>
                <Card.Body>
                  <Row>
                    <Col>
                      <PieChart
                        data={[
                          {title:'Preparing',value:(this.state.myProject.preparing),color:'#FB654E'},
                          {title:'On Progress',value:(this.state.myProject.onprogress),color:'#ADD8E6'},
                          {title:'Closed',value:(this.state.myProject.closed),color:'#90EE90'},
                        ]}
                      />
                    </Col>
                    <Col>
                      <div className="vertical-center">
                        <h6><span style={{color:'#FB654E'}}>■ </span>Preparing {this.state.myProject.preparing}</h6>
                        <h6><span style={{color:'#ADD8E6'}}>■ </span>On Progress {this.state.myProject.onprogress}</h6>
                        <h6><span style={{color:'#90EE90'}}>■ </span>Closed {this.state.myProject.closed}</h6>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Header><b style={{fontSize:20}}>Employee</b></Card.Header>
                <Card.Body>
                  <Row>
                    <Col>
                      <PieChart data={this.state.division}/>
                    </Col>
                    <Col>
                      <div className="vertical-center">
                        {this.state.division.map((item,index) => {
                          return (
                            <h6 key={index}>
                              <span style={{color:item.color}}>■ </span>{item.title} {item.value}
                            </h6>
                          )
                        })}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <Row>
                    <Col lg={8}>
                      <div style={{fontSize:7.5,color:'white'}}>All client in this organization</div>
                      <h3>Total Client</h3>
                      <h3>{this.state.client}</h3>
                    </Col>
                    <Col lg={4}>
                      <div style={{paddingTop:'10%',paddingLeft:'45%'}}>
                        <Users size={60}/>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card><br/>
              <Card>
                <Card.Body>
                  <Row>
                    <Col lg={8}>
                      <div style={{fontSize:7.5,color:'white'}}>All project in this organization</div>
                      <h3>Total Project</h3>
                      <h3>{
                        this.state.myProject.preparing +
                        this.state.myProject.onprogress +
                        this.state.myProject.closed
                      }</h3>
                    </Col>
                    <Col lg={4}>
                      <div style={{paddingTop:'10%',paddingLeft:'45%'}}>
                        <Trello size={60}/>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

}