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
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <Container fluid>
          <ContentClient webservice={this.props.webservice}/>
        </Container>
      </div>
    )
  }
}