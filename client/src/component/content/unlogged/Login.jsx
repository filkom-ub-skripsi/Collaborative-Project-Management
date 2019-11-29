import React from 'react'
import { NotificationManager } from 'react-notifications'
import { Form, Col, Button, Spinner } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import MD5 from 'md5'

//fetch
const fetch = createApolloFetch({
  uri: 'http://localhost:4000/graphql',
})

//array
const form = [
  {field:'login_email'},
  {field:'login_password'},
]

//spinner
const spinner = <Spinner animation="border" size="sm"/>

//button
const button_name = 'Login'

//class
export default class ContentLogin extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      disabled:false,
      button:button_name
    }
  }

  //validate
  validate() {
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

  //login
  login() {
    if (this.validate() === true) {
      this.setState({
        disabled:true,
        button:spinner
      })
      var email = document.getElementById('login_email').value
      var password = MD5(document.getElementById('login_password').value)
      fetch({
        query:`{
          employee (email:"`+email+`") {
            _id,
            password,
            organization {
              _id,
              leader {
                leader
              }
            }
          }
        }`
      }).then(result => {
        this.setState({
          disabled:false,
          button:button_name
        })
        if (result.data.employee === null) {
          NotificationManager.error('Email not registered')
          form.forEach(function(item){
            document.getElementById(item.field).className = 'form-control is-invalid'
          })
        } else {
          document.getElementById('login_email').className = 'form-control is-valid'
          if (password === result.data.employee.password) {
            NotificationManager.success('Login successful','',1000)
            document.getElementById('login_password').className = 'form-control is-valid'
            localStorage.setItem('user', result.data.employee._id)
            localStorage.setItem('organization', result.data.employee.organization[0]['_id'])
            if (result.data.employee.organization[0]['leader'][0]['leader'] === result.data.employee._id) { localStorage.setItem('leader',1) }
            else { localStorage.setItem('leader',0) }
            setTimeout(()=>{window.location.reload()},1500)
          } else {
            NotificationManager.error('Incorrect password')
            document.getElementById('login_password').className = 'form-control is-invalid'
          }
        }
      })
    }
  }

  //render
  render() {
    return (
      <Form.Row>
        <Col>
          <Form.Control type="text" id="login_email" placeholder="Email" autoComplete="off"/>
        </Col>
        <Col>
          <Form.Control type="password" id="login_password" placeholder="Password" autoComplete="off"/>
        </Col>
        <Col>
          <Button
            variant="outline-dark"
            disabled={this.state.disabled}
            onClick={()=>this.login()}
          >
            {this.state.button}
          </Button>
        </Col>
      </Form.Row>
    )
  }
}