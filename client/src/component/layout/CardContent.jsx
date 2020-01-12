import React from 'react'
import { Card } from 'react-bootstrap'

export default class LayoutCardContent extends React.Component {
  render() {
    return (
      <Card className="animated faster fadeIn">
        <Card.Header>
          {this.props.header}
        </Card.Header>
        {this.props.table === true &&
          <div>
            {this.props.body}
          </div>
        }
        {this.props.table === undefined &&
          <Card.Body>
            {this.props.body}
          </Card.Body>
        }
      </Card>
    )
  }
}