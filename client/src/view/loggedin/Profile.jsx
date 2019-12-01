import React from 'react'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentProfile from '../../component/content/loggedin/profile/Profile'

const breadcrumb = [
	{name:'Setting',link:'#!'},
	{name:'Profile',link:'/profile'}
]

export default class ViewProfile extends React.Component {
  componentDidMount(){
    document.title = 'Profile'
  }
  render() {
    return (
      <Container fluid>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <ContentProfile webservice={this.props.webservice}/>
      </Container>
    )
  }
}