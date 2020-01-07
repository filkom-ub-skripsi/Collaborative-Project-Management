import React from 'react'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'}
]

export default class ViewScrumBoard extends React.Component {
  componentDidMount(){
    document.title = 'Scrum Board - Loading...'
  }
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
      </div>
    )
  }
}