import React from 'react'
// import RDS from 'randomstring'
// import MD5 from 'md5'
import Swal from 'sweetalert'
import { Row, Col, Button, Modal, Form } from 'react-bootstrap'
import { HelpCircle, RefreshCcw } from 'react-feather'
import { NotificationManager } from 'react-notifications'
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

//class
export default class ContentEmployee extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      data:[],
      add_employee_modal:false,
      detail_modal:false,detail_id:null,detail_header:null,
      detail_division:'',detail_division_default:''
    }
  }

  // component will receive props
  UNSAFE_componentWillReceiveProps(props){
    var data = []
    var temp = props.data
    temp.forEach(function(item_d){
      item_d.employee.forEach(function(item_e){
        data.push(item_e)
      })
    })
    this.setState({data:data})
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
                {this.props.data.map((item,index) => {
                  return ( <option value={item.id} key={index}>{item.name}</option> )
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
      var check = this.state.data.filter(function(item){ return item.email === document.getElementById('tambah_email').value })
      if (check.length === 0) {
        this.props.add(
          document.getElementById('tambah_name').value,
          document.getElementById('tambah_email').value,
          document.getElementById('tambah_contact').value,
          document.getElementById('tambah_division').value,
        )
        this.setState({add_employee_modal:false})
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
    {name:'Division',selector:'division_name',sortable:true,width:'15%'},
    {name:'Project',selector:'project',sortable:true,width:'15%'},
  ]

  //table handler
  table_handler(id){
    if (id.split('_')[0] !== localStorage.getItem('user')){
      var data = this.state.data.filter(function(item){ return item.id === id })
      this.setState({
        detail_modal:true,
        detail_id:data[0]['id'],
        detail_header:data[0]['name'],
        detail_division:data[0]['division_id'],
        detail_division_default:data[0]['division_id'],
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
        {localStorage.getItem('leader') === '1' &&
          <Modal.Footer>
              <Button
                variant="info"
                onClick={()=>this.detail_reset()}
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
      detail_division:'',detail_division_default:''
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
    Swal({
      title:"Delete",
      text:"This employee will be deleted",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        this.props.delete(this.state.detail_id)
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
        loading={this.props.loading}
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