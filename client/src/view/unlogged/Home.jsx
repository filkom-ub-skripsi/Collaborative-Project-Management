import React from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import ImageLogo from '../../component/image/logo.png'
import ImageHome from '../../component/image/home.png'
import LayoutAppbar from '../../component/layout/Appbar'
import ContentSignUp from '../../component/content/unlogged/Signup'
import ContentLogin from '../../component/content/unlogged/Login'

//class
export default class ViewHome extends React.Component {

  //component did mount
  componentDidMount(){
    document.title = 'Collaborative Project Management'
  }

  //left
  appbar_left(){
    return (
      <Form inline className="animated fast fadeIn">
        <img src={ImageLogo} alt="Logo" width="150px"/>
      </Form>
    )
  }
  
  //right
  appbar_right(){
    return (
      <Form inline className="animated fast fadeIn">
        <ContentLogin webservice={this.props.webservice}/>
      </Form>
    )
  }

  //render
  render() {
    return (
      <div>
        <LayoutAppbar
          left={this.appbar_left()}
          right={this.appbar_right()}
        />
        <Container>
          <Row>
            <Col lg={6}>
              <div className="animated fast fadeIn">
                <b style={{fontSize:30}}>Manage Projects Efficiently With Team Collaboration</b>
                <div style={{paddingBottom:20}}/>
                <img src={ImageHome} alt="Logo" width="100%"/>
              </div>
            </Col>
            <Col lg={6}>
              <div className="animated fast fadeIn">
                <ContentSignUp webservice={this.props.webservice}/>
              </div> 
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
  
}