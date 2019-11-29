import React from 'react'
import { Container } from 'react-bootstrap'
import { AlertTriangle } from 'react-feather'
import LayoutBreadcrumb from '../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Error',link:'#!'},
]

const centervertical = {
  margin:'0',
  position:'absolute',
  top:'50%',
  left:'50%',
  transform:'translate(-50%,-50%)',
}

export default class PageError extends React.Component {
  constructor(props){
    super(props)
    document.title = 'Error'
  }
  render() {
		return (
      <Container fluid>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
          <div className="text-center animated faster fadeIn" style={centervertical}>
          <AlertTriangle size={125}/>
          <h1>404 Error</h1>
          <h2>Page Not Found</h2>
        </div>
      </Container>
		)
	}
}