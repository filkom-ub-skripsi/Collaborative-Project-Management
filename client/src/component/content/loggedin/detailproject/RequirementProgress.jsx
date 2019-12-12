import React from 'react'
import { Edit3 } from 'react-feather'
import LayoutTable from 'react-data-table-component'

//class
export default class ContentRequirementProgress extends React.Component {

  //column
  columns = [
    {
      cell: (row) => <a href="#!" onClick={()=>{this.props.handler(row.id)}}><Edit3 size={19}/></a>,
      ignoreRowClick:true,allowOverflow:true,button:true,width:'56px'
    },
    {selector:'name',sortable:true,width:'20%'},
    {selector:'detail',sortable:true},
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