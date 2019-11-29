import React from 'react'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import LayoutTabPill from '../../component/layout/TabPill'
import ContentDivision from '../../component/content/loggedin/user/Division'
import ContentEmployee from '../../component/content/loggedin/user/Employee'

const breadcrumb = [
	{name:'Setting',link:'#!'},
	{name:'Users',link:'/users'}
]

const tabpill = [
  {
    tab:'division',
    name:'Division',
    content:<ContentDivision/>
  },
  {
    tab:'employee',
    name:'Employee',
    content:<ContentEmployee/>
  },
]

export default class ViewUsers extends React.Component {
  constructor(props){
    super(props)
    document.title = 'Users'
  }
  render() {
    return (
      <Container fluid>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <LayoutTabPill data={tabpill} tab={2} content={10}/>
      </Container>
    )
  }
}