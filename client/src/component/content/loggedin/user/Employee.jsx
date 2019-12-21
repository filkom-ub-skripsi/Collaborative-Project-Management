import React from 'react'
import Swal from 'sweetalert'
import { Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap'
import { HelpCircle, RefreshCcw } from 'react-feather'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import LayoutCardContent  from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'

//notification
const success = 'Your changes have been successfully saved'

//form
const employee_add_form = [
  {field:'tambah_name',feedback:'tambah_fname'},
  {field:'tambah_email',feedback:'tambah_femail'},
  {field:'tambah_contact',feedback:'tambah_fcontact'},
  {field:'tambah_division',feedback:'tambah_fdivision'},
]

//misc
const add_default = 'Add'
const add_loading = <Spinner animation="border" size="sm"/>

//class
export default class ContentEmployee extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      data:[],
      add_employee_modal:false,add_button:add_default,add_state:false,
      detail_modal:false,detail_id:null,detail_header:null,
      detail_leader:null,detail_division:'',detail_division_default:''
    }
  }

  //get derived state from props
  static getDerivedStateFromProps(props,state) {
    var data = []
    props.data.forEach(function(item_d){
      item_d.employee.forEach(function(item_e){ data.push(item_e) })
    })
    if (data !== state.data) {
      return { data:data }
    }
    return null
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //add employee modal
  add_employee_modal(){
    return (
      <Modal
        backdrop="static"
        keyboard={false}
        centered
        show={this.state.add_employee_modal}
        onHide={()=>this.setState({add_employee_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
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
            <Form.Group>
              <Form.Label>Division</Form.Label>
              <Form.Control id="tambah_division" as="select" defaultValue="">
                <option value="" hidden></option>
                {
                  this.props.data
                    .filter(item => item.id !== this.props.leader)
                    .map((item,index) => {
                    return <option value={item.id} key={index}>{item.name}</option>
                  })
                }
              </Form.Control>
              <div id="tambah_fdivision" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={this.state.add_state}
            onClick={()=>this.add_employee_handler()}
          >
            {this.state.add_button}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //add employee validation
  add_employee_validation(){
    var counter = 0
    employee_add_form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
        document.getElementById(item.feedback).innerHTML = 'this field cannot be empty'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        document.getElementById(item.feedback).innerHTML = ''
        counter++
      }
    })
    if (counter === employee_add_form.length) {
      return true
    }
  }

  //add employee handler
  add_employee_handler(){
    if (this.add_employee_validation() === true) {
      this.setState({add_button:add_loading,add_state:true})
      var check = this.state.data.filter(function(item){ return item.email === document.getElementById('tambah_email').value })
      if (check.length === 0) {
        this.fetch({query:'{employee(email:"'+document.getElementById('tambah_email').value+'"){_id}}'})
        .then(result => {
          if (result.data.employee === null) {
            this.props.add(
              document.getElementById('tambah_name').value,
              document.getElementById('tambah_email').value,
              document.getElementById('tambah_contact').value,
              document.getElementById('tambah_division').value,
            )
            this.setState({add_employee_modal:false,add_button:add_default,add_state:false})
            NotificationManager.success(success)
            NotificationManager.info('Default password is 1234')
          } else {
            document.getElementById('tambah_email').className = 'form-control is-invalid'
            document.getElementById('tambah_femail').innerHTML = 'this email has already been used in another organization'
            this.setState({add_button:add_default,add_state:false})
          }
        })
      } else {
        document.getElementById('tambah_email').className = 'form-control is-invalid'
        document.getElementById('tambah_femail').innerHTML = 'this email is already being used at this organization'
        this.setState({add_button:add_default,add_state:false})
      }
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
    {name:'Email',selector:'email',sortable:true},
    {name:'Mobile Number',selector:'contact',sortable:true,width:'15%'},
    {name:'Division',selector:'division_name',sortable:true,width:'15%'},
    {name:'Project',selector:'project',sortable:true,width:'15%'},
  ]

  //table handler
  table_handler(id){
    var data = this.state.data.filter(function(item){ return item.id === id })
    var leader = null
    if (data[0]['division_id'] === this.props.leader) { leader = true }
    else { leader = false }
    this.setState({
      detail_modal:true,
      detail_id:data[0]['id'],
      detail_header:data[0]['name'],
      detail_division:data[0]['division_id'],
      detail_division_default:data[0]['division_id'],
      detail_leader:leader
    })
  }

  //detail modal
  detail_modal(){
    var data = []
    var temp = []
    var id = this.state.detail_id
    this.props.data.forEach(function(item_d){
      item_d.employee.forEach(function(item_e){
        if (item_e.id === id) { temp.push(item_e) }
      })
    })
    temp.forEach(function(item_temp){
      item_temp.data.forEach(function(item){
        var progress = null
        if (item.status === '0') { progress = 'Preparing' }
        else if (item.status === '2') { progress = 'Closed' }
        else if (item.status === '1') {
          var counter = 0
          item.module.forEach(function(module){
            var done = module.requirement.filter(function(search){ return search.status === '1' })
            if (module.requirement.length === done.length) { counter++ }
          })
          progress = 'On Progress ('+Math.round(counter/item.module.length*100)+'%)'
        }
        data.push({
          project:'['+item.code+'] '+item.name,
          progress:progress
        })
      })
    })
    const columns = [
      {name:'Project',selector:'project',sortable:true},
      {name:'Progress',selector:'progress',sortable:true,width:'25%'},
    ]
    return (
      <Modal
        size="lg"
        backdrop="static"
        keyboard={false}
        centered
        show={this.state.detail_modal}
        onHide={()=>this.detail_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.state.detail_header}</Modal.Title>
        </Modal.Header>
        {localStorage.getItem('leader') === '1' && this.state.detail_leader === false &&
          <Modal.Body>
            <Form>
              <Form.Row>
                <Col lg={10}>
                  <Form.Control id="sunting_division" as="select" value={this.state.detail_division} onChange={(e)=>this.setState({detail_division:e.target.value})}>
                    <option value="" hidden></option>
                    {this.props.data.map((item,index) => {
                      return ( <option value={item.id.split('_')[0]} key={index}>{item.name}</option> )
                    })}
                  </Form.Control>
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
          data={data}
        />
        {localStorage.getItem('leader') === '1' &&
          <Modal.Footer>
            <Button
              variant="info"
              onClick={()=>this.detail_reset()}
            >
              Reset Password
            </Button>
            {this.state.detail_leader === false &&
              <Button
                variant="danger"
                onClick={()=>this.detail_delete()}
              >
                Delete
              </Button>
            }
          </Modal.Footer>
        } 
      </Modal>
    )
  }

  //detail close
  detail_close(){
    this.setState({
      detail_modal:false,detail_id:null,detail_header:null,
      detail_leader:null,detail_division:'',detail_division_default:''
    })
  }

  //detail edit
  detail_edit(){
    if (this.state.detail_division !== this.state.detail_division_default) {
      this.props.edit(this.state.detail_id,this.state.detail_division_default,this.state.detail_division)
      this.detail_close()
      NotificationManager.success(success)
    }
  }

  //detail reset
  detail_reset(){
    Swal({
      title:"Reset Password",
      text:"This member's password will return to default",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willReset) => {
      if (willReset) {
        this.props.reset(this.state.detail_id)
        this.detail_close()
        NotificationManager.success(success)
        NotificationManager.info('Default password is 1234')
      }
    })
  }

  //detail delete
  detail_delete(){
    var id = this.state.detail_id
    var check = this.state.data.filter(function(item){ return item.id === id })
    if (check[0]['project'] === 0) {
      Swal({
        title:"Delete",
        text:"This employee will be deleted",
        icon:"warning",
        closeOnClickOutside:false,
        buttons:true,
        dangerMode:true,
      }).then((willDelete) => {
        if (willDelete) {
          this.props.delete(id)
          this.detail_close()
          NotificationManager.success(success)
        }
      })
    } else {
      Swal({
        title:"Not Available",
        text:"There are projects that are currently registered",
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
          <b style={{fontSize:20}}>Employee List</b>
        </Col>
        <Col className="text-right">
          {localStorage.getItem('leader') === '1' &&
            <Button
              size="sm"
              variant="outline-dark"
              disabled={this.props.loading}
              onClick={()=>this.setState({add_employee_modal:true})}
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
        data={this.state.data}
      />
    )
  }

  //render
  render() {
    return (
      <div>
        {this.add_employee_modal()}
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