import React from 'react'
import { Circle } from 'react-feather'
import LayoutTable from 'react-data-table-component'

//class
export default class ContentRequirement extends React.Component {

  //column
  columns = [
    {selector:'number',sortable:false,width:"56px"},
    {selector:'name',sortable:true,width:'25%'},
    {selector:'detail',sortable:true},
    {
      cell: (row) => <a href="#!" onClick={()=>{this.props.handler(row.id)}}><Circle size={22}/></a>,
      ignoreRowClick:true,allowOverflow:true,button:true,width:'6%'
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