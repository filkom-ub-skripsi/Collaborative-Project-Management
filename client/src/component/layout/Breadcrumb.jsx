import React from 'react'
import { Link } from 'react-router-dom'

export default class LayoutBreadcrumb extends React.Component {
  render() {
    return (
      <nav>
        <ol className="breadcrumb">
          {
            this.props.breadcrumb.map((item,index) => {
              return (
                <Link to={item.link} key={index} className="breadcrumb-item">
                  {item.name}
                </Link>
              )
            })
          }
        </ol>
      </nav>
    )
  }
}