import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Tab, Card, Nav, Row, Col, Button, OverlayTrigger, Popover } from 'react-bootstrap'
import { RefreshCcw } from 'react-feather'

//refresh
const refresh_default = <RefreshCcw size={15} style={{marginBottom:2}}/>
const refresh_loading = 'Loading...'

//class
export default class ContentScrum extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
      header_button:true,header_refresh:refresh_loading,
      requirement:[],issue:[],employee:[]
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //get derived state from props
  static getDerivedStateFromProps(props) {
    return {
      requirement:props.requirement,
      employee:props.employee,
      issue:props.issue,
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.setState({
      header_button:false,
      header_refresh:refresh_default,
    })
  }

  //reload
  reload(){
    this.setState({
      header_button:true,
      header_refresh:refresh_loading
    })
    this.push()
  }

  //menu add
  menu_add(){
    return (
      <Popover>
        <Popover.Content>
          <Button
            size="sm" variant="outline-dark" block
            onClick={()=>{

              this.refs.overlay.handleHide()
            }}
          >
            Backlog
          </Button>
          <Button
            size="sm" variant="outline-dark" block
            onClick={()=>{

              this.refs.overlay.handleHide()
            }}
          >
            Sprint
          </Button>
        </Popover.Content>
      </Popover>
    )
  }

  //render
  render(){
    return (
      <div>
        <Tab.Container defaultActiveKey="TAB1">
          <Card>
            <Card.Header>
              <Row>
                <Col>
                  <Nav variant="tabs">
                    <Nav.Item>
                      <Nav.Link eventKey="TAB1">Backlog</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="TAB2">Sprint</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Col>
                <Col className="text-right">
                  {localStorage.getItem('leader') === '1' &&
                    <OverlayTrigger trigger="click" placement="left" rootClose overlay={this.menu_add()} ref='overlay'>
                      <Button
                        size="sm"
                        variant="outline-dark"
                        disabled={this.state.header_button}
                      >
                        Add
                      </Button>
                    </OverlayTrigger>
                    
                  }
                  <span style={{paddingRight:15}}/>
                  <Button
                    size="sm"
                    variant="outline-dark"
                    disabled={this.state.header_button}
                    onClick={()=>this.reload()}
                  >
                    {this.state.header_refresh}
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Tab.Content>
              <Tab.Pane eventKey="TAB1">
                <div className="container-detail-project">
                  
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey="TAB2">
                <div className="container-detail-project">
                  
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Card>
        </Tab.Container>
      </div>
    )
  }

}