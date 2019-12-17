import React from 'react'
import MD5 from 'md5'
import Swal from 'sweetalert'
import { Accordion, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap'
import { ChevronDown } from 'react-feather'
import { createApolloFetch } from 'apollo-fetch'
import { NotificationManager } from 'react-notifications'
import LayoutCardContent from '../../../layout/CardContent'

//validation
const wrong = 'Wrong password'
const success = 'Your changes have been successfully saved'

//style
const size_icon = 16
const style_font = { fontSize:size_icon, color:'black' }
const style_icon = { position:'absolute', right:size_icon, top:size_icon }

//spinner
const spinner = <Spinner animation="border" size="sm"/>
const loading = 'Loading...'

//button
const button_name = 'Change'

//class
export default class ContentProfile extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      readOnly:true,
      disabled:true,
      button:button_name,
      name:loading,
      contact:loading,
      email:loading,
      organization:loading,
      division:'',
      password:''
    }
  }

  //component did mount
  componentDidMount(){
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({
      query:`{
        employee(_id:"`+localStorage.getItem('user')+`") {
          name, contact, email, password,
          organization { name },
          division { name }
        }
      }`
    }).then(result => {
      var data = result.data.employee
      var division = data.division
      if (division.length === 0) { division = '' }
      else { division = '('+division[0]['name']+')' }
      this.setState({
        name:data.name,
        email:data.email,
        contact:data.contact,
        organization:data.organization[0].name,
        division:division,
        password:data.password,
        readOnly:false,
        disabled:false,
      })
    })
  }

  //validation
  validation(form){
    var counter = 0
    form.forEach(function(item){
      if (document.getElementById(item.field).value === '') {
        document.getElementById(item.field).className = 'form-control is-invalid'
      } else {
        document.getElementById(item.field).className = 'form-control is-valid'
        counter++
      }
    })
    if (counter === form.length) {
      return true
    }
  }

  //clear
  clear(form){
    form.forEach(function(item){
      document.getElementById(item.field).value = ''
      document.getElementById(item.field).className = 'form-control'
    })
  }

  //loading
  loading(condition){
    if (condition === true) {
      this.setState({
        disabled:true,
        button:spinner
      })
    } else if (condition === false) {
      this.setState({
        disabled:false,
        button:button_name
      })
    }
  }

  //edit organization
  edit_organization(){
    var form = [{field:'organization_name'},{field:'organization_password'}]
    if (this.validation(form) === true) {
      var name = document.getElementById('organization_name').value
      var pass = MD5(document.getElementById('organization_password').value)
      if (pass === this.state.password) {
        document.getElementById('organization_password').className = 'form-control is-valid'
        this.fetch({query:`
          mutation {
            organization_edit(
              _id:"`+localStorage.getItem('organization')+`",
              name:"`+name+`"
            ){_id}
          }`
        })
        this.setState({organization:name})
        this.clear(form)
        NotificationManager.success(success)
      } else {
        document.getElementById('organization_password').className = 'form-control is-invalid'
        NotificationManager.error(wrong)
      }
    }
  }

  //edit name
  edit_name(){
    var form = [{field:'name_name'},{field:'name_password'}]
    if (this.validation(form) === true) {
      var name = document.getElementById('name_name').value
      var pass = MD5(document.getElementById('name_password').value)
      if (pass === this.state.password) {
        document.getElementById('name_password').className = 'form-control is-valid'
        this.fetch({query:`
          mutation {
            employee_edit(
              _id:"`+localStorage.getItem('user')+`",
              name:"`+name+`"
            ){_id}
          }`
        })
        this.setState({name:name})
        this.clear(form)
        NotificationManager.success(success)
      } else {
        document.getElementById('name_password').className = 'form-control is-invalid'
        NotificationManager.error(wrong)
      }
    }
  }

  //edit email
  edit_email(){
    var form = [{field:'email_email'},{field:'email_password'}]
    if (this.validation(form) === true) {
      var email = document.getElementById('email_email').value
      var pass = MD5(document.getElementById('email_password').value)
      if (pass === this.state.password) {
        this.loading(true)
        document.getElementById('email_password').className = 'form-control is-valid'
        this.fetch({
          query:`{employee(email:"`+email+`"){name}}`
        }).then(result => {
          this.loading(false)
          if (result.data.employee === null) {
            this.fetch({query:`
              mutation {
                employee_edit(
                  _id:"`+localStorage.getItem('user')+`",
                  email:"`+email+`"
                ){_id}
              }`
            })
            this.setState({email:email})
            this.clear(form)
            NotificationManager.success(success)
          } else {
            document.getElementById('email_email').className = 'form-control is-invalid'
            Swal({
              title:"Failed",
              text:"This email is already in use",
              icon:"warning",
              closeOnClickOutside:false,
            })
          }
        })
      } else {
        NotificationManager.error(wrong)
        document.getElementById('email_password').className = 'form-control is-invalid'
      }
    }
  }

  //edit contact
  edit_contact(){
    var form = [{field:'contact_contact'},{field:'contact_password'}]
    if (this.validation(form) === true) {
      var contact = document.getElementById('contact_contact').value
      var pass = MD5(document.getElementById('contact_password').value)
      if (pass === this.state.password) {
        document.getElementById('contact_password').className = 'form-control is-valid'
        this.fetch({query:`
          mutation {
            employee_edit(
              _id:"`+localStorage.getItem('user')+`",
              contact:"`+contact+`"
            ){_id}
          }`
        })
        this.setState({contact:contact})
        this.clear(form)
        NotificationManager.success(success)
      } else {
        document.getElementById('contact_password').className = 'form-control is-invalid'
        NotificationManager.error(wrong)
      }
    }
  }

  //edit password
  edit_password(){
    var form = [{field:'password_1'},{field:'password_2'}]
    if (this.validation(form) === true) {
      var pass1 = MD5(document.getElementById('password_1').value)
      var pass2 = MD5(document.getElementById('password_2').value)
      if (pass2 === this.state.password) {
        document.getElementById('password_2').className = 'form-control is-valid'
        this.fetch({query:`
          mutation {
            employee_edit(
              _id:"`+localStorage.getItem('user')+`",
              password:"`+pass1+`"
            ){_id}
          }`
        })
        this.setState({password:pass1})
        this.clear(form)
        NotificationManager.success(success)
      } else {
        document.getElementById('password_2').className = 'form-control is-invalid'
        NotificationManager.error(wrong)
      }
    }
  }

  //card header
  card_header() {
    return (
      <div>
        {localStorage.getItem('leader') === '1' &&
          <b style={{fontSize:20}}>Leader of Organization</b>
        }
        {localStorage.getItem('leader') === '0' &&
          <b style={{fontSize:20}}>{this.state.organization+' '+this.state.division}</b>
        }
      </div>
    )
  }

  //card body
  card_body() {
    return (
      <Accordion>
        {localStorage.getItem('leader') === '1' &&
          <div>
            <Accordion.Toggle eventKey={0} className='list-group-item list-group-item-action border-0'>
              <Row><Col><b style={style_font}>Organization</b><br/><b style={style_font}>{this.state.organization}</b></Col>
              <Col className="text-right"><ChevronDown size={size_icon} style={style_icon}/></Col></Row>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={0}>
              <Card.Body>
                <Form>
                  <Form.Row>
                    <Col lg={5}><Form.Control type="text" id="organization_name" placeholder="Change the name of the organization" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                    <Col lg={5}><Form.Control type="password" id="organization_password" placeholder="Current password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                    <Col lg={2}><Button variant="outline-dark" block disabled={this.state.disabled} onClick={()=>this.edit_organization()}>{this.state.button}</Button></Col>
                  </Form.Row>
                </Form>
              </Card.Body>
            </Accordion.Collapse>
          </div>
        }
        <Accordion.Toggle eventKey={1} className='list-group-item list-group-item-action border-0'>
          <Row><Col><b style={style_font}>Name</b><br/><b style={style_font}>{this.state.name}</b></Col>
          <Col className="text-right"><ChevronDown size={size_icon} style={style_icon}/></Col></Row>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={1}>
          <Card.Body>
            <Form>
              <Form.Row>
                <Col lg={5}><Form.Control type="text" id="name_name" placeholder="Change name" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={5}><Form.Control type="password" id="name_password" placeholder="Current password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={2}><Button variant="outline-dark" block disabled={this.state.disabled} onClick={()=>this.edit_name()}>{this.state.button}</Button></Col>
              </Form.Row>
            </Form>
          </Card.Body>
        </Accordion.Collapse>
        <Accordion.Toggle eventKey={2} className='list-group-item list-group-item-action border-0'>
          <Row><Col><b style={style_font}>Email</b><br/><b style={style_font}>{this.state.email}</b></Col>
          <Col className="text-right"><ChevronDown size={size_icon} style={style_icon}/></Col></Row>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={2}>
          <Card.Body>
            <Form>
              <Form.Row>
                <Col lg={5}><Form.Control type="text" id="email_email" placeholder="Change email" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={5}><Form.Control type="password" id="email_password" placeholder="Current password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={2}><Button variant="outline-dark" block disabled={this.state.disabled} onClick={()=>this.edit_email()}>{this.state.button}</Button></Col>
              </Form.Row>
            </Form>
          </Card.Body>
        </Accordion.Collapse>
        <Accordion.Toggle eventKey={3} className='list-group-item list-group-item-action border-0'>
          <Row><Col><b style={style_font}>Mobile Number</b><br/><b style={style_font}>{this.state.contact}</b></Col>
          <Col className="text-right"><ChevronDown size={size_icon} style={style_icon}/></Col></Row>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={3}>
          <Card.Body>
            <Form>
              <Form.Row>
                <Col lg={5}><Form.Control type="text" id="contact_contact" placeholder="Change mobile number" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={5}><Form.Control type="password" id="contact_password" placeholder="Current password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={2}><Button variant="outline-dark" block disabled={this.state.disabled} onClick={()=>this.edit_contact()}>{this.state.button}</Button></Col>
              </Form.Row>
            </Form>
          </Card.Body>
        </Accordion.Collapse>
        <Accordion.Toggle eventKey={4} className='list-group-item list-group-item-action border-0'>
          <Row><Col><b style={style_font}>Password</b><br/><b style={style_font}>-</b></Col>
          <Col className="text-right"><ChevronDown size={size_icon} style={style_icon}/></Col></Row>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={4}>
          <Card.Body>
            <Form>
              <Form.Row>
                <Col lg={5}><Form.Control type="password" id="password_1" placeholder="Change password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={5}><Form.Control type="password" id="password_2" placeholder="Current password" autoComplete="off" readOnly={this.state.readOnly}/></Col>
                <Col lg={2}><Button variant="outline-dark" block disabled={this.state.disabled} onClick={()=>this.edit_password()}>{this.state.button}</Button></Col>
              </Form.Row>
            </Form>
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    )
  }
  
  //render
  render() {
    return (
      <LayoutCardContent
        header={this.card_header()}
        body={this.card_body()}
        table={true}
      />  
    )
  }
  
}