import React from 'react'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { Row, Col, Button, Modal, Form } from 'react-bootstrap'
import { RefreshCcw, HelpCircle } from 'react-feather'
import { createApolloFetch } from 'apollo-fetch'
import LayoutCardContent  from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'

//fetch
const fetch = createApolloFetch({
  uri: 'http://localhost:4000/graphql',
})

//notification
const success = 'Your changes have been successfully saved'

//form
const client_add_form = [
  {field:'tambah_name',feedback:'tambah_fname'},
  {field:'tambah_address',feedback:'tambah_faddress'},
  {field:'tambah_email',feedback:'tambah_femail'},
  {field:'tambah_contact',feedback:'tambah_fcontact'},
]
const client_edit_form = [
  {field:'sunting_name',feedback:'sunting_fname'},
  {field:'sunting_address',feedback:'sunting_faddress'},
  {field:'sunting_email',feedback:'sunting_femail'},
  {field:'sunting_contact',feedback:'sunting_fcontact'},
]

//class
export default class ContentClient extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      header_button:true,
      data:[],data_loading:true,
      add_client_modal:false,edit_client_modal:false,
      edit_form_name:'',edit_form_address:'',edit_form_email:'',edit_form_contact:'',
      detail_modal:false,detail_header:null,detail_id:null,detail_data:[],
    }
    this.push()
  }

  push(){
    fetch({query:`
      {
        organization(_id:"`+localStorage.getItem('organization')+`") {
          client{
            _id,
            name,
            email,
            contact,
            address,
            project {
              code,
              name,
              status,
              employee {
                name
              },
              module {
                requirement {
                  status
                }
              }
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.client
      temp.forEach(function(item){
        data.push({
          id:item._id+'_'+0,
          name:item.name,
          email:item.email,
          contact:item.contact,
          address:item.address,
          project:item.project.length,
          data:item.project
        })
      })
      this.setState({
        data:data,
        data_loading:false,
        header_button:false
      })
    })
  }

  //reload
  reload(){
    this.setState({
      data_loading:true,
      header_button:true
    })
    this.push()
  }

  //add client modal
  add_client_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_client_modal}
        onHide={()=>this.setState({add_client_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" id="tambah_address"/>
              <div id="tambah_faddress" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" id="tambah_email"/>
              <div id="tambah_femail" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control type="text" id="tambah_contact"/>
              <div id="tambah_fcontact" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_client_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //edit client modal
  edit_client_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.edit_client_modal}
        onHide={()=>this.detail_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={this.state.edit_form_name} onChange={(e)=>this.setState({edit_form_name:e.target.value})} id="sunting_name"/>
              <div id="sunting_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" value={this.state.edit_form_address} onChange={(e)=>this.setState({edit_form_address:e.target.value})} id="sunting_address"/>
              <div id="sunting_faddress" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" value={this.state.edit_form_email} onChange={(e)=>this.setState({edit_form_email:e.target.value})} id="sunting_email"/>
              <div id="sunting_femail" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control type="text" value={this.state.edit_form_contact} onChange={(e)=>this.setState({edit_form_contact:e.target.value})} id="sunting_contact"/>
              <div id="sunting_fcontact" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.edit_client_handler()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //client validation
  client_validation(form){
    var counter = 0
    form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
        document.getElementById(item.feedback).innerHTML = 'this field cannot be empty'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        document.getElementById(item.feedback).innerHTML = ''
        counter++
      }
    })
    if (counter === form.length) {
      return true
    }
  }

  //add client handler
  add_client_handler(){
    if (this.client_validation(client_add_form) === true) {
      var id = RDS.generate({length:32,charset:'alphabetic'})
      fetch({query:`
        mutation { 
          client_add(
            _id:"`+id+`",
            organization:"`+localStorage.getItem('organization')+`",
            name:"`+document.getElementById('tambah_name').value+`",
            email:"`+document.getElementById('tambah_email').value+`",
            contact:"`+document.getElementById('tambah_contact').value+`",
            address:"`+document.getElementById('tambah_address').value+`"
          ){_id}
        }`
      })
      this.setState({
        add_client_modal:false,
        data: [...this.state.data,{
          id:id+'_'+0,
          name:document.getElementById('tambah_name').value,
          email:document.getElementById('tambah_email').value,
          contact:document.getElementById('tambah_contact').value,
          address:document.getElementById('tambah_address').value,
          project:0,
          data:[]
        }] 
      })
      NotificationManager.success(success)
    }
  }

  //edit client handler
  edit_client_handler(){
    if (this.client_validation(client_edit_form) === true) {
      var id = this.state.detail_id
      fetch({query:`
        mutation{
          client_edit(
            _id:"`+id.split('_')[0]+`",
            name:"`+document.getElementById('sunting_name').value+`",
            email:"`+document.getElementById('sunting_email').value+`",
            contact:"`+document.getElementById('sunting_contact').value+`",
            address:"`+document.getElementById('sunting_address').value+`"
          ){_id}
        }`
      })
      var data = this.state.data
      data.forEach(function(item){
        if (item.id === id) {
          var version = parseInt(item.id.split('_')[1])+1
          item.id = item.id.split('_')[0]+'_'+version
          item.name = document.getElementById('sunting_name').value
          item.email = document.getElementById('sunting_email').value
          item.contact = document.getElementById('sunting_contact').value
          item.address = document.getElementById('sunting_address').value
        }
      })
      this.setState({data:data})
      this.detail_close()
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
    {name:'Name',selector:'name',sortable:true},
    {name:'Address',selector:'address',sortable:true},
    {name:'Email',selector:'email',sortable:true,width:'20%'},
    {name:'Mobile Number',selector:'contact',sortable:true,width:'15%'},
    {name:'Project',selector:'project',sortable:true,width:'15%'},
  ]

  //table handler
  table_handler(id){
    var data = this.state.data.filter(function(item){ return item.id === id })
    var temp = []
    data[0]['data'].forEach(function(item){
      var progress = null
      if (item.status === '0') { progress = 'Preparing' }
      else if (item.status === '2') { progress = 'Finished' }
      else if (item.status === '1') {
        var counter = 0
        item.module.forEach(function(module){
          var done = module.requirement.filter(function(search){ return search.status === '1' })
          if (module.requirement.length === done.length) { counter++ }
        })
        progress = 'On Progress ('+Math.round(counter/item.module.length*100)+'%)'
      }
      temp.push({
        project:'['+item.code+'] '+item.name,
        leader:item.employee[0]['name'],
        progress:progress
      })
    })
    this.setState({detail_modal:true,detail_id:id,detail_header:data[0].name,detail_data:temp})
  }

  //detail modal
  detail_modal(){
    const columns = [
      {name:'Project',selector:'project',sortable:true},
      {name:'Leader',selector:'leader',sortable:true,width:'25%'},
      {name:'Progress',selector:'progress',sortable:true,width:'25%'},
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
        <LayoutTable
          noHeader={true}
          columns={columns}
          data={this.state.detail_data}
        />
        <Modal.Footer>
          <Button
            variant="info"
            onClick={()=>this.detail_edit()}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={()=>this.detail_delete()}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //detail edit
  detail_edit(){
    var id = this.state.detail_id
    var temp = this.state.data
    var data = temp.filter(function(item){ return item.id === id })
    this.setState({
      detail_modal:false,
      edit_form_name:data[0].name,
      edit_form_address:data[0].address,
      edit_form_email:data[0].email,
      edit_form_contact:data[0].contact,
      edit_client_modal:true,
    })
  }

  //detail delete
  detail_delete(){
    Swal({
      title:"Delete",
      text:"This client will be deleted",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        var id = this.state.detail_id
        var temp = this.state.data.filter(function(item){ return item.id === id })
        if (temp[0]['project'] === 0) {
          fetch({query:`
            mutation{
              client_delete(_id:"`+id.split('_')[0]+`"){_id}
            }`
          })
          var data = this.state.data.filter(function(item){ return ( item.id !== id ) })
          this.setState({data:data}) 
          this.detail_close()
          NotificationManager.success(success)
        } else {
          Swal({
            title:"Failed",
            text:"There are projects that are currently registered",
            icon:"warning",
            closeOnClickOutside:false,
          })
        }
      }
    })
  }

  //detail close
  detail_close(){
    this.setState({ 
      detail_modal:false,detail_id:null,detail_header:null,detail_data:[],
      edit_client_modal:false,
    })
  }

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Client List</b>
        </Col>
        <Col className="text-right">
          <Button
            size="sm"
            variant="outline-dark"
            disabled={this.state.header_button}
            onClick={()=>this.setState({add_client_modal:true})}
          >
            Add
          </Button>
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
        {this.add_client_modal()}
        {this.edit_client_modal()}
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