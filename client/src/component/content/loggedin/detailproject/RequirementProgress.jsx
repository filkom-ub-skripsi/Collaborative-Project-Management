import React from 'react'
import { Edit3 } from 'react-feather'
import LayoutTable from 'react-data-table-component'

//class
export default class ContentRequirementProgress extends React.Component {

  //leader
  columns_leader = [
    {
      cell: (row) => <a href="#!" onClick={()=>{this.props.handler(row.id)}}><Edit3 size={19}/></a>,
      ignoreRowClick:true,allowOverflow:true,button:true,width:'56px'
    },
    {selector:'name',sortable:true,width:'20%'},
    {selector:'detail',sortable:true},
    {selector:'progress',sortable:true,width:'10%'},
  ]

  //collaborator
  columns_collaborator = [
    {selector:'number',sortable:true,width:'56px'},
    {selector:'name',sortable:true,width:'20%'},
    {selector:'detail',sortable:true},
    {selector:'progress',sortable:true,width:'10%'},
  ]

  //render
  render() {
    var columns = null
    if (localStorage.getItem('leader') === '1') { columns = this.columns_leader }
    else { columns = this.columns_collaborator }
    return (
      <LayoutTable
        dense
        highlightOnHover
        noTableHead
        noHeader
        columns={columns}
        data={this.props.data.requirement}
      />
    )
  }
  
}