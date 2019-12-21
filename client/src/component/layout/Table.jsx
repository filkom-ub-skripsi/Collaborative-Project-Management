import React from 'react'
import { Container, Spinner } from 'react-bootstrap'
import DataTable from 'react-data-table-component'

const loading = () => {
  return (
    <Container>
      <div style={{margin:16}}/>
      <Spinner animation="border" size="sm"/>
      <div style={{margin:16}}/>
    </Container>
  )
}

export default class LayoutTable extends React.Component {
  render() {
    return (
      <DataTable
        dense
        striped
        pagination
        highlightOnHover
        progressPending={this.props.loading}
        progressComponent={loading()}
        noHeader={this.props.noHeader}
        title={this.props.title}
        columns={this.props.columns}
        data={this.props.data}
        expandableRows={this.props.expandable}
        expandableRowsComponent={this.props.component}
      />
    )
  }
}