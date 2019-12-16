import React from 'react'
import LayoutTable from 'react-data-table-component'

//class
export default class ContentRequirementProgress extends React.Component {

  //columns
  columns = [
    {selector:'number',sortable:true,width:'56px'},
    {selector:'name',sortable:true,width:'20%'},
    {selector:'detail',sortable:true},
    {selector:'progress',sortable:true,width:'10%'},
  ]

  //render
  render() {
    return (
      <LayoutTable
        dense
        highlightOnHover
        noTableHead
        noHeader
        columns={this.columns}
        data={this.props.data.requirement}
      />
    )
  }
  
}