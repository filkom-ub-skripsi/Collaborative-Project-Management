import React from 'react'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import { HelpCircle, RefreshCcw } from 'react-feather'
import LayoutCardContent  from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'

//notification
const success = 'Your changes have been successfully saved'

//class
export default class ContentDivision extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      add_division_modal:false, 
      detail_modal:false,detail_id:null,detail_header:null,
      detail_employee:[],detail_leader:null,
    }
  }

  //add division modal
  add_division_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_division_modal}
        onHide={()=>this.setState({add_division_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Division</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{paddingBottom:15}}/>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Control type="text" id="tambah_name" placeholder="Division name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_division_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //add division handler
  add_division_handler(){
    if (document.getElementById('tambah_name').value === '') {
      document.getElementById('tambah_name').className = 'form-control is-invalid'
      document.getElementById('tambah_fname').innerHTML = 'this field cannot be empty'
    } else {
      document.getElementById('tambah_name').className = 'form-control is-valid'
      document.getElementById('tambah_fname').innerHTML = ''
      this.props.add(document.getElementById('tambah_name').value)
      this.setState({add_division_modal:false})
      NotificationManager.success(success)
    }
  }

  //table columns
  table_columns = [
    {
      cell: (row) => <a href="#!" onClick={()=>{this.table_handler(row.id)}}><HelpCircle size={22}/></a>,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {name:'Division',selector:'name',sortable:true},
    {name:'Employee',selector:'member',sortable:true},
  ]

  //table handler
  table_handler(id){
    var data = this.props.data.filter(function(item){ return item.id === id })
    var leader = null
    if (id === this.props.leader) { leader = true }
    else { leader = false }
    this.setState({
      detail_modal:true,
      detail_id:data[0]['id'],
      detail_header:data[0]['name'],
      detail_employee:data[0]['employee'],
      detail_leader:leader
    })
  }

  //detail modal
  detail_modal(){
    const columns = [
      {name:'Name',selector:'name',sortable:true},
      {name:'Email',selector:'email',sortable:true},
      {name:'Mobile number',selector:'contact',sortable:true},
      {name:'Project',selector:'project',sortable:true},
    ]
    return (
      <Modal
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.detail_modal}
        onHide={()=>this.detail_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.detail_header}</Modal.Title>
        </Modal.Header>
        {localStorage.getItem('leader') === '1' &&
          <div>
            {this.state.detail_leader === false &&
              <Modal.Body>
                <Form autoComplete="off">
                  <Form.Row>
                    <Col lg={10}>
                      <Form.Control type="text" id="detail_name" placeholder="Change the division name"/>
                    </Col>
                    <Col lg={2}>
                      <Button
                        variant="outline-dark" block
                        onClick={()=>this.detail_edit()}
                      >
                        Edit
                      </Button>
                    </Col>
                  </Form.Row>
                </Form>
              </Modal.Body>
            }
            <LayoutTable
              noHeader={true}
              columns={columns}
              data={this.state.detail_employee}
            />
          </div>
        }
        {localStorage.getItem('leader') === '0' &&
          <LayoutTable
            noHeader={true}
            columns={columns}
            data={this.state.detail_employee}
          />
        }
        {localStorage.getItem('leader') === '1' && this.state.detail_leader === false &&
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={()=>this.detail_delete()}
            >
              Delete
            </Button>
          </Modal.Footer>
        }
      </Modal>
    )
  }

  //detail close
  detail_close(){
    this.setState({
      detail_modal:false,detail_id:null,detail_header:null,
      detail_employee:[],detail_leader:null,
    })
  }

  //detail edit
  detail_edit(){
    if (document.getElementById('detail_name').value === '') {
      document.getElementById('detail_name').className = 'form-control is-invalid'
    } else {
      document.getElementById('detail_name').className = 'form-control is-valid'
      this.props.edit(this.state.detail_id,document.getElementById('detail_name').value)
      this.detail_close()
      NotificationManager.success(success)
    }
  }

  //detail delete
  detail_delete(){
    if (this.state.detail_employee.length === 0) {
      Swal({
        title:"Delete",
        text:"This division will be deleted",
        icon:"warning",
        closeOnClickOutside:false,
        buttons:true,
        dangerMode:true,
      })
      .then((willDelete) => {
        if (willDelete) {
          this.props.delete(this.state.detail_id)
          this.detail_close()
          NotificationManager.success(success)
        }
      })
    } else {
      Swal({
        title:"Not Available",
        text:"There are members who are currently registered",
        icon:"warning",
        closeOnClickOutside:false,
      })
    }
  }

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Division List</b>
        </Col>
        <Col className="text-right">
          {localStorage.getItem('leader') === '1' &&
            <Button
              size="sm"
              variant="outline-dark"
              disabled={this.props.loading}
              onClick={()=>this.setState({add_division_modal:true})}
            >
              Add
            </Button>
          }
          <span style={{paddingRight:15}}/>
          <Button
            size="sm"
            variant="outline-dark"
            disabled={this.props.loading}
            onClick={()=>this.props.reload()}
          >
            <RefreshCcw size={15} style={{marginBottom:2}}/>
          </Button>
        </Col>
      </Row>
    )
  }

  //card body
  card_body(){
    return (
      <LayoutTable
        noHeader={true}
        loading={this.props.table}
        columns={this.table_columns}
        data={this.props.data}
      />
    )
  }

  //render
  render() {
    return (
      <div>
        {this.add_division_modal()}
        {this.detail_modal()}
        <LayoutCardContent
          header={this.card_header()}
          body={this.card_body()}
          table={true}
        />
      </div>
    )
  }
  
}