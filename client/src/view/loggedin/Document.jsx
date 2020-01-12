import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'}
]

//class
export default class ViewIssue extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.match.params.id,
      breadcrumb:breadcrumb,
    }
  }

  //component did mount
  componentDidMount(){
    document.title = 'Document - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        name,
      }
    }`}).then(result => {
      let project = result.data.project
      document.title = 'Document - '+project.name
      this.setState({
        breadcrumb:[...breadcrumb,{
          name:project.name,
          link:'/detail-project/'+this.state.project_id
        },{
          name:'Document',
          link:'/document/'+this.state.project_id
        }],
      })
    })
  }

  //render
  render(){
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>

        </Container>
      </div>
    )
  }

}