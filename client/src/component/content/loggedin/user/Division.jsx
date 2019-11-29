import React from 'react'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Button, Row, Col, Modal, Form } from 'react-bootstrap'
import { HelpCircle, RefreshCcw } from 'react-feather'
import LayoutCardContent  from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'

//fetch
const fetch = createApolloFetch({
  uri: 'http://localhost:4000/graphql',
})

//notification
const success = 'Your changes have been successfully saved'

//class
export default class ContentDivision extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      header_button:true,
      data:[],data_loading:true,
      add_division_modal:false, 
      detail_modal:false,detail_id:null,detail_header:null,detail_data:[],
    }
    this.push()
  }

  //push
  push(){
    fetch({
      query:`{
        organization(_id:"`+localStorage.getItem('organization')+`") {
          division {
            _id,
            name,
            employee {
              name,
              email,
              contact
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.division
      temp.forEach(function(item){
        data.push({
          id:item._id+'_'+0,
          division:item.name,
          employee:item.employee.length,
          data:item.employee
        })
      })
      this.setState({
        data:data,
        data_loading:false,
        header_button:false,
      })
    })
  }
 
  //reload
  reload(){
    this.setState({
      data_loading:true,
      header_button:true,
    })
    this.push()
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
      var id = RDS.generate({length:32,charset:'alphabetic'})
      fetch({query:`
        mutation {
          division_add(
            _id:"`+id+`",
            organization:"`+localStorage.getItem('organization')+`",
            name:"`+document.getElementById('tambah_name').value+`"
          ){_id}
        }`
      })
      this.setState({
        add_division_modal:false,
        data: [...this.state.data,{
          id: id+'_'+0,
          division:document.getElementById('tambah_name').value,
          employee:0
        }] 
      })
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
    {name:'Division',selector:'division',sortable:true},
    {name:'Employee',selector:'employee',sortable:true},
  ]

  //table handler
  table_handler(id){
    var temp = this.state.data
    var data = temp.filter(function(item){ return item.id === id })
    this.setState({detail_modal:true,detail_id:id,detail_header:data[0]['division'],detail_data:data[0]['data']})
  }

  //detail modal
  detail_modal(){
    const columns = [
      {name:'Name',selector:'name',sortable:true},
      {name:'Email',selector:'email',sortable:true},
      {name:'Mobile number',selector:'contact',sortable:true},
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
            <LayoutTable
              noHeader={true}
              columns={columns}
              data={this.state.detail_data}
            />
          </div>
        }
        {localStorage.getItem('leader') === '0' &&
          <LayoutTable
            noHeader={true}
            columns={columns}
            data={this.state.detail_data}
          />
        }
        {localStorage.getItem('leader') === '1' &&
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
    this.setState({detail_modal:false,detail_id:null,detail_header:null,detail_data:[]})
  }

  //detail edit
  detail_edit(){
    if (document.getElementById('detail_name').value === '') { document.getElementById('detail_name').className = 'form-control is-invalid' }
    else {
      document.getElementById('detail_name').className = 'form-control is-valid'
      var id = this.state.detail_id
      fetch({query:`
        mutation {
          division_edit(
            _id:"`+id.split('_')[0]+`",
            name:"`+document.getElementById('detail_name').value+`"
          ){_id}
        }`
      })
      var data = this.state.data
      data.forEach(function(item){
        if (item.id === id) {
          var version = parseInt(item.id.split('_')[1])+1
          item.id = item.id.split('_')[0]+'_'+version
          item.division = document.getElementById('detail_name').value
        }
      })
      this.setState({data:data})
      this.detail_close()
      NotificationManager.success(success)
    }
  }

  //detail delete
  detail_delete(){
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
        var id = this.state.detail_id
        var temp = this.state.data.filter(function(item){ return item.id === id })
        if (temp[0]['employee'] === 0) {
          fetch({query:`
            mutation {
              division_delete(_id:"`+id.split('_')[0]+`"){_id}
            }`
          })
          var data = this.state.data.filter(function(item){return(item.id!==id)})
          this.setState({data:data})
          this.detail_close()
          NotificationManager.success(success)
        } else {
          Swal({
            title:"Failed",
            text:"There are members who are currently registered",
            icon:"warning",
            closeOnClickOutside:false,
          })
        }
      }
    })
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
              disabled={this.state.header_button}
              onClick={()=>this.setState({add_division_modal:true})}
            >
              Add
            </Button>
          }
          <span style={{paddingRight:15}}/>
          <Button
            size="sm"
            variant="outline-dark"
            disabled={this.state.header_button}
            onClick={()=>this.reload()}
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
        loading={this.state.data_loading}
        columns={this.table_columns}
        data={this.state.data}
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