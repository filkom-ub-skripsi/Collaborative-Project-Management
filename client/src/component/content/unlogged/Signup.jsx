import React from 'react'
import { NotificationManager } from 'react-notifications'
import { Form, Button, Spinner } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import RDS from 'randomstring'
import MD5 from 'md5'

//misc
const button_name = 'Sign Up'
const spinner = <Spinner animation="border" size="sm"/>
const form = [
  {field:'name',feedback:'fname'},
  {field:'organization',feedback:'forganization'},
  {field:'contact',feedback:'fcontact'},
  {field:'email',feedback:'femail'},
  {field:'password',feedback:'fpassword'},
]

//class
export default class ContentSignup extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      disabled:false,
      button:button_name
    }
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //validate
  validate(){
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

  //signup
  signup(){
    if(this.validate() === true) {
      this.setState({
        disabled:true,
        button:spinner
      })
      var _id_employee = RDS.generate({length: 32,charset:'alphabetic'})
      var _id_organization = RDS.generate({length: 32,charset:'alphabetic'})
      var name = document.getElementById('name').value
      var contact = document.getElementById('contact').value
      var email = document.getElementById('email').value
      var password = MD5(document.getElementById('password').value)
      var organization = document.getElementById('organization').value
      this.fetch({
        query:`{
          employee(email:"`+email+`"){name}
        }`
      }).then(result => {
        if (result.data.employee === null) {
          this.fetch({
            query:`
              mutation {
                employee_add(
                  _id:"`+_id_employee+`",
                  password:"`+password+`",
                  organization:"`+_id_organization+`",
                  division:"",
                  name:"`+name+`",
                  email:"`+email+`",
                  contact:"`+contact+`"
                ){_id}
              }`
          }).then(() => {
            this.fetch({query:`
              mutation {
                organization_add(
                  _id:"`+_id_organization+`",
                  name:"`+organization+`"
                ){_id}
              }`
            })
            this.fetch({query:`
              mutation {
                rule_add(
                  organization:"`+_id_organization+`",
                  leader:"`+_id_employee+`"
                ){organization}
              }`
            })
            form.forEach(function(item){
              document.getElementById(item.field).value = ''
              document.getElementById(item.field).className = 'form-control'
              document.getElementById(item.feedback).innerHTML = ''
            })
            this.setState({
              disabled:false,
              button:button_name
            })
            NotificationManager.success('Registration successful')
          })
        } else {
          document.getElementById('email').className = 'form-control is-invalid'
          document.getElementById('femail').innerHTML = 'this email is already registered'
          this.setState({
            disabled:false,
            button:button_name
          })
        }
      })
    }
  }

  //render
  render() {
    return (
      <div>
        <h1>Create an account</h1>
        <h2>It's quick and easy.</h2>
        <div style={{paddingBottom:15}}/>
        <Form autoComplete="off">
          <Form.Group>
            <Form.Control type="text" id="name" placeholder="Your name"/>
            <div id="fname" className="invalid-feedback d-block"/>
          </Form.Group>
          <Form.Group>
            <Form.Control type="text" id="organization" placeholder="Your organization"/>
            <div id="forganization" className="invalid-feedback d-block"/>
          </Form.Group>
          <Form.Group>
            <Form.Control type="text" id="contact" placeholder="Mobile number"/>
            <div id="fcontact" className="invalid-feedback d-block"/>
          </Form.Group>
          <Form.Group>
            <Form.Control type="text" id="email" placeholder="Email"/>
            <div id="femail" className="invalid-feedback d-block"/>
          </Form.Group>
          <Form.Group>
            <Form.Control type="password" id="password" placeholder="Password"/>
            <div id="fpassword" className="invalid-feedback d-block"/>
          </Form.Group>
          <Button
            variant="outline-success"
            disabled={this.state.disabled}
            onClick={()=>this.signup()}
          >
            {this.state.button}
          </Button>
        </Form>
      </div>
    )
  }
}