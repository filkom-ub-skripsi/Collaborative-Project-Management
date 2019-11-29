import React from 'react'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Home',link:'/'}
]

export default class ViewHome extends React.Component {
  constructor(props){
    super(props)
    document.title = 'Home'
  }
  render() {
    return (
      <Container fluid>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
      </Container>
    )
  }
}