import React from 'react'
import { Tab, Row, Col, Nav } from 'react-bootstrap'

export default class LayoutTabPill extends React.Component {
  render() {
    return (
      <div className="animated faster fadeIn">
        <Tab.Container defaultActiveKey={this.props.data[0]['tab']}>
          <Row>
            <Col lg={this.props.tab}>
              <Nav variant="pills" className="flex-column">
                {
                  this.props.data.map((item,index) => {
                    return (
                      <Nav.Item key={index}>
                        <Nav.Link eventKey={item.tab}>{item.name}</Nav.Link>
                      </Nav.Item>
                    )
                  })
                }
              </Nav>
            </Col>
            <Col lg={this.props.content}>
              <Tab.Content>
                {
                  this.props.data.map((item,index) => {
                    return (
                      <Tab.Pane eventKey={item.tab} key={index}>{item.content}</Tab.Pane>
                    )
                  })
                }
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    )
  }
}