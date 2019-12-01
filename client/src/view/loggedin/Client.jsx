import React from 'react'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentClient from '../../component/content/loggedin/client/Client'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Client',link:'/clients'}
]

export default class ViewClient extends React.Component {
  componentDidMount(){
    document.title = 'Client'
  }
  render() {
    return (
      <Container fluid>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <ContentClient webservice={this.props.webservice}/>
      </Container>
    )
  }
}