import React from 'react'
import RDS from 'randomstring'
import MD5 from 'md5'
import Swal from 'sweetalert'
import { Row, Col, Button, Modal, Form } from 'react-bootstrap'
import { HelpCircle, RefreshCcw } from 'react-feather'
import { NotificationManager } from 'react-notifications'
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
const employee_add_form = [
  {field:'tambah_name',feedback:'tambah_fname'},
  {field:'tambah_email',feedback:'tambah_femail'},
  {field:'tambah_contact',feedback:'tambah_fcontact'},
  {field:'tambah_division',feedback:'tambah_fdivision'},
]

//class
export default class ContentEmployee extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      header_button:true,
      data:[],data_division:[],data_loading:true,
      add_employee_modal:false,
      detail_modal:false,detail_id:null,detail_header:null,
      detail_optionValue:'',detail_form_edit_state:true,
    }
    this.push()
  }

  //push
  push(){
    fetch({
      query:`
      {
        organization(_id:"`+localStorage.getItem('organization')+`") {
          employee{
            _id,
            name,
            contact,
            email,
            division {
              name
            },
            organization {
              leader {
                leader 
              }
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.employee
      temp.forEach(function(item){
        if (item._id !== item.organization[0]['leader'][0]['leader']) {
          data.push({
            id:item._id+'_'+0,
            name:item.name,
            email:item.email,
            contact:item.contact,
            division:item.division[0]['name'],
            project:'0'
          })
        }
      })
      this.setState({
        data:data,
        data_loading:false,
        header_button:false
      })
    })
    fetch({
      query:
      `{
        organization(_id:"`+localStorage.getItem('organization')+`") {
          division {
            _id,
            name
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.organization.division
      temp.forEach(function(item){
        data.push({
          value:item._id,
          label:item.name
        })
      })
      this.setState({data_division:data})
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
                {this.state.data_division.map((item,index) => {
                  return ( <option value={item.value+'_'+item.label} key={index}>{item.label}</option> )
                })}
              </Form.Control>
              <div id="tambah_fdivision" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_employee_handler()}
          >
            Add
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
      var temp = this.state.data.filter(function(item){ return item.email === document.getElementById('tambah_email').value })
      if (temp.length === 0) {
        var id = RDS.generate({length:32,charset:'alphabetic'})
        fetch({query:`
          mutation {
            employee_add(
              _id:"`+id+`",
              password:"`+MD5('1234')+`",
              organization:"`+localStorage.getItem('organization')+`",
              division:"`+document.getElementById('tambah_division').value.split('_')[0]+`",
              name:"`+document.getElementById('tambah_name').value+`",
              contact:"`+document.getElementById('tambah_contact').value+`",
              email:"`+document.getElementById('tambah_email').value+`"
            ){_id}
          }`
        })
        this.setState({
          add_employee_modal:false,
          data: [...this.state.data,{
            id:id+'_'+0,
            name:document.getElementById('tambah_name').value,
            email:document.getElementById('tambah_email').value,
            contact:document.getElementById('tambah_contact').value,
            division:document.getElementById('tambah_division').value.split('_')[1],
            project:'0'
          }] 
        })
        NotificationManager.success(success)
        NotificationManager.info('Default password is 1234')
      } else {
        document.getElementById('tambah_email').className = 'form-control is-invalid'
        document.getElementById('tambah_femail').innerHTML = 'this email is already in use'
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
    {name:'Division',selector:'division',sortable:true,width:'15%'},
    {name:'Project',selector:'project',sortable:true,width:'15%'},
  ]

  //table handler
  table_handler(id){
    if (id.split('_')[0] !== localStorage.getItem('user')){
      var temp = this.state.data
      var data = temp.filter(function(item){ return item.id === id })
      this.setState({detail_modal:true,detail_id:id,detail_header:data[0]['name']})
      fetch({query:
        `{
          employee(_id:"`+id.split('_')[0]+`") {
            division {
              _id,
              name
            }
          }
        }`
      }).then(result => {
        var optionValue = result.data.employee.division[0]['_id']+'_'+result.data.employee.division[0]['name']
        this.setState({
          detail_optionValue:optionValue,
          detail_form_edit_state:false,
          detail_btn_edit_state:false,
        })
      })
    }
  }

  //detail modal
  detail_modal(){
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
        {localStorage.getItem('leader') === '1' &&
          <Modal.Body>
            <Form>
              <Form.Row>
                <Col lg={10}>
                  <Form.Control id="sunting_division" as="select" value={this.state.detail_optionValue} onChange={(e)=>this.setState({detail_optionValue:e.target.value})} disabled={this.state.detail_form_edit_state}>
                    <option value="" hidden></option>
                    {this.state.data_division.map((item,index) => {
                      return ( <option value={item.value+'_'+item.label} key={index}>{item.label}</option> )
                    })}
                  </Form.Control>
                </Col>
                <Col lg={2}>
                  <Button
                    variant="outline-dark" block
                    disabled={this.state.detail_btn_edit_state}
                    onClick={()=>this.detail_edit()}
                  >
                    Edit
                  </Button>
                </Col>
              </Form.Row>
            </Form>
          </Modal.Body>
        }
        {localStorage.getItem('leader') === '1' &&
          <Modal.Footer>
              <Button
                variant="info"
                onClick={()=>this.detail_resetPassword()}
              >
                Reset Password
              </Button>
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
      detail_optionValue:'',detail_form_edit_state:true,detail_btn_edit_state:true,
    })
  }

  //detail edit
  detail_edit(){
    var id = this.state.detail_id
    fetch({query:`
      mutation {
        employee_edit(
          _id:"`+id.split('_')[0]+`",
          division:"`+document.getElementById('sunting_division').value.split('_')[0]+`"
        ){_id}
      }`
    })
    var data = this.state.data
    data.forEach(function(item){
      if (item.id === id) {
        var version = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+version
        item.division = document.getElementById('sunting_division').value.split('_')[1]
      }
    })
    this.setState({data:data})
    this.detail_close()
    NotificationManager.success(success)
  }

  //detail reset password
  detail_resetPassword(){
    Swal({
      title:"Reset Password",
      text:"This member's password will return to default",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willReset) => {
      if (willReset) {
        var id = this.state.detail_id
        fetch({query:`
          mutation {
            employee_edit(
              _id:"`+id.split('_')[0]+`",
              password:"`+MD5('1234')+`"
            ){_id}
          }`
        })
        this.detail_close()
        NotificationManager.success(success)
        NotificationManager.info('Default password is 1234')
      }
    })
  }

  //detail delete
  detail_delete(){
    Swal({
      title:"Delete",
      text:"This employee will be deleted",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        var id = this.state.detail_id
        fetch({query:`
          mutation {
            employee_delete(_id:"`+id.split('_')[0]+`"){_id}
          }`
        })
        var data = this.state.data.filter(function(item){ return ( item.id !== id ) })
        this.setState({data:data})
        this.detail_close()
        NotificationManager.success(success)
      }
    })
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
              disabled={this.state.header_button}
              onClick={()=>{
                this.setState({add_employee_modal:true})
              }}
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