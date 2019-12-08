import React from 'react'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Home',link:'/'}
]

export default class ViewHome extends React.Component {
  componentDidMount(){
    document.title = 'Home'
  }
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
      </div>
    )
  }
}