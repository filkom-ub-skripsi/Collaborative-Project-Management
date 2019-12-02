import React from 'react'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentMyProject from '../../component/content/loggedin/myproject/MyProject'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'My Projects',link:'/my-projects'}
]

export default class ViewMyProjects extends React.Component {
  componentDidMount(){
    document.title = 'My Projects'
  }
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <Container fluid>
          <ContentMyProject webservice={this.props.webservice}/>
        </Container>
      </div>
    )
  }
}