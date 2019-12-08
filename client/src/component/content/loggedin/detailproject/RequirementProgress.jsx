import React from 'react'
import { Edit3 } from 'react-feather'
import LayoutTable from 'react-data-table-component'

//class
export default class ContentRequirementProgress extends React.Component {

  //column
  columns = [
    {selector:'number',sortable:false,width:"56px"},
    {selector:'name',sortable:true,width:'20%'},
    {selector:'detail',sortable:true},
    {
      cell: (row) => <a href="#!" onClick={()=>{this.props.handler(row.id)}}><Edit3 size={19}/></a>,
      ignoreRowClick:true,allowOverflow:true,button:true,width:'250px'
    },
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