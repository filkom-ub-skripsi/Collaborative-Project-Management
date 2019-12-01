import React from 'react'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Row, Col, Button, Modal, Form, OverlayTrigger, Popover } from 'react-bootstrap'
import { CheckCircle, RefreshCcw } from 'react-feather'
import LayoutCardContent from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'
import ContentRequirement from './Requirement'

//notification
const success = 'Your changes have been successfully saved'

//module
const module_add_form = [
  {field:'tambah_name',feedback:'tambah_fname'},
  {field:'tambah_detail',feedback:'tambah_fdetail'},
]
const module_edit_form = [
  {field:'sunting_name',feedback:'sunting_fname'},
  {field:'sunting_detail',feedback:'sunting_fdetail'},
]

//requirement
const requirement_add_form = [
  {field:'tambah_module_req',feedback:'tambah_fmodule_req'},
  {field:'tambah_name_req',feedback:'tambah_fname_req'},
  {field:'tambah_detail_req',feedback:'tambah_fdetail_req'},
]
const requirement_edit_form = [
  {field:'sunting_name_req',feedback:'sunting_fname_req'},
  {field:'sunting_detail_req',feedback:'sunting_fdetail_req'},
  {field:'sunting_module_req',feedback:'sunting_fmodule_req'},
]

//class
export default class ContentModule extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
      header_button:
      true,data:[],data_loading:true,
      add_module_modal:false,add_requirement_modal:false,
      edit_form_module:'',edit_form_name:'',edit_form_detail:'',
      requirement_modal:false,detail_modal:false,detail_id:null,
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
        project(_id:"`+this.props.id+`") {
          module {
            _id,
            name,
            detail,
            requirement {
              _id,
              name,
              detail
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      var temp = result.data.project.module
      temp.forEach(function(item_m){
        var requirement = []
        item_m.requirement.forEach(function(item_r){
          requirement.push({
            number:'-',
            id:item_r._id,
            name:item_r.name,
            detail:item_r.detail,
            module:item_m._id
          })
        })
        data.push({
          id:item_m._id+'_'+0,
          name:item_m.name,
          detail:item_m.detail,
          requirement:requirement,
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

  //replace \n
  insert_replace(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'\\n')
  }

  //form validation
  form_validation(form){
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

  //menu add
  menu_add(){
    return (
      <Popover size="lg">
        <Popover.Title>What do you want to add?</Popover.Title>
        <Popover.Content>
          <Button
            size="sm"
            variant="dark"
            block
            onClick={()=>{
              this.setState({add_module_modal:true})
              this.refs.overlay.handleHide()
            }}
          >
            Module
          </Button>
          <Button
            size="sm"
            variant="dark"
            block
            onClick={()=>{
              this.setState({add_requirement_modal:true})
              this.refs.overlay.handleHide()
            }}
          >
            Requirement
          </Button>
        </Popover.Content>
      </Popover>
    )
  }

  //add module modal
  add_module_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_module_modal}
        onHide={()=>this.setState({add_module_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Module</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name"/>
              <div id="tambah_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" as="textarea" rows="3" id="tambah_detail"/>
              <div id="tambah_fdetail" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_module_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //add module handler
  add_module_handler(){
    if (this.form_validation(module_add_form) === true) {
      var id = RDS.generate({length:32,charset:'alphabetic'})
      var project = this.state.project_id
      this.fetch({query:`
        mutation {
          module_add(
            _id:"`+id+`",
            project:"`+project+`",
            name:"`+document.getElementById('tambah_name').value+`",
            detail:"`+this.insert_replace(document.getElementById('tambah_detail').value)+`"
          ){_id}
        }`
      })
      this.setState({
        add_module_modal:false,
        data: [...this.state.data,{
          id:id+'_'+0,
          name:document.getElementById('tambah_name').value,
          detail:document.getElementById('tambah_detail').value,
          requirement:[]
        }] 
      })
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code = 'M0'
      var activity_detail = document.getElementById('tambah_name').value
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.props.activity(activity_code,activity_detail,activity_date)
      NotificationManager.success(success)
    }
  }

  //add requirement modal
  add_requirement_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.add_requirement_modal}
        onHide={()=>this.setState({add_requirement_modal:false})}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Requirement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Module</Form.Label>
              <Form.Control id="tambah_module_req" as="select">
                <option value="" hidden></option>
                {this.state.data.map((item,index) => {
                  return (
                    <option value={item.id.split('_')[0]+'_'+item.name} key={index}>{item.name}</option>
                  )
                })}
              </Form.Control>
              <div id="tambah_fmodule_req" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="tambah_name_req"/>
              <div id="tambah_fname_req" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" as="textarea" rows="3" id="tambah_detail_req"/>
              <div id="tambah_fdetail_req" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={()=>this.add_requirement_handler()}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    ) 
  }

  //add requirement handler
  add_requirement_handler(){
    if (this.form_validation(requirement_add_form) === true) {
      var id = RDS.generate({length:32,charset:'alphabetic'})
      var project = this.state.project_id 
      this.fetch({query:`
        mutation {
          requirement_add(
            _id:"`+id+`",
            project:"`+project+`",
            module:"`+document.getElementById('tambah_module_req').value.split('_')[0]+`",
            name:"`+document.getElementById('tambah_name_req').value+`",
            detail:"`+this.insert_replace(document.getElementById('tambah_detail_req').value)+`",
            status:"0"
          ){_id}
        }`
      })
      var data = this.state.data
      data.forEach(function(item){
        if (item.id.split('_')[0] === document.getElementById('tambah_module_req').value.split('_')[0]) {
          item.requirement = [...item.requirement,{
            number:'-',
            id:id,
            name:document.getElementById('tambah_name_req').value,
            detail:document.getElementById('tambah_detail_req').value,
            module:document.getElementById('tambah_module_req').value.split('_')[0]
          }]
        }
      })
      this.setState({data:data})
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code = 'R0'
      var activity_detail = document.getElementById('tambah_name_req').value+'_'+document.getElementById('tambah_module_req').value.split('_')[1]
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.props.activity(activity_code,activity_detail,activity_date)
      this.setState({add_requirement_modal:false})
      NotificationManager.success(success)
    }
  }

  //table columns
  table_columns = [
    {name:'Requirement',selector:'name',sortable:true,width:'25%'},
    {name:'Detail',selector:'detail',sortable:true},
    {
      cell: (row) => <a href="#!" onClick={()=>{this.table_handler(row.id)}}><CheckCircle size={22}/></a>,
      ignoreRowClick:true,allowOverflow:true,button:true,width:"78px"
    },
  ]

  //table handler
  table_handler(id){
    var data = this.state.data.filter(function(item){ return item.id === id })
    this.setState({
      detail_modal:true,detail_id:id,
      edit_form_name:data[0]['name'],
      edit_form_detail:data[0]['detail'],
    })
  }

  //detail modal
  detail_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.detail_modal}
        onHide={()=>this.detail_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Module</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="sunting_name" value={this.state.edit_form_name} onChange={(e)=>this.setState({edit_form_name:e.target.value})}/>
              <div id="sunting_fname" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" id="sunting_detail" as="textarea" rows="3" value={this.state.edit_form_detail} onChange={(e)=>this.setState({edit_form_detail:e.target.value})}/>
              <div id="sunting_fdetail" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={()=>this.detail_delete()}
          >
            Delete
          </Button>
          <Button
            variant="primary"
            onClick={()=>this.detail_save()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //detail close
  detail_close(){
    this.setState({
      detail_id:null,
      detail_modal:false,
      edit_form_name:'',
      edit_form_detail:'',
    })
  }

  //detail save
  detail_save(){
    if (this.form_validation(module_edit_form) === true) {
      var id = this.state.detail_id
      var name = this.state.edit_form_name
      var detail = this.state.edit_form_detail
      this.fetch({query:`
        mutation {
          module_edit(
            _id:"`+id.split('_')[0]+`",
            name:"`+name+`",
            detail:"`+this.insert_replace(detail)+`"
          ){_id}
        }`
      })
      var data = this.state.data
      data.forEach(function(item){
        if (item.id === id) {
          var version = parseInt(item.id.split('_')[1])+1
          item.id = item.id.split('_')[0]+'_'+version
          item.name = name
          item.detail = detail
        }
      })
      this.setState({data:data})
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code = 'M1'
      var activity_detail = name
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.props.activity(activity_code,activity_detail,activity_date)
      this.detail_close()
      NotificationManager.success(success)
    }
  }

  //detail delete
  detail_delete(){
    var id = this.state.detail_id
    var temp = this.state.data.filter(function(item){ return item.id === id })
    if (temp[0]['requirement'].length === 0) {
      Swal({
        title:"Delete",
        text:"This module will be deleted",
        icon:"warning",
        closeOnClickOutside:false,
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          this.fetch({query:`
            mutation {
              module_delete(_id:"`+id.split('_')[0]+`"){_id}
            }`
          })
          var data = this.state.data.filter(function(item){ return ( item.id !== id ) })
          this.setState({ data:data })
          var activity_id = RDS.generate({length:32,charset:'alphabetic'})
          var activity_code = 'M2'
          var activity_detail = temp[0]['name']
          var activity_date = new Date()
          this.fetch({query:`
            mutation {
              activity_add(
                _id:"`+activity_id+`",
                project:"`+this.state.project_id+`",
                code:"`+activity_code+`",
                detail:"`+activity_detail+`",
                date:"`+activity_date+`"
              ){_id}
            }`
          })
          this.props.activity(activity_code,activity_detail,activity_date)
          this.detail_close()
          NotificationManager.success(success)
        }
      })
    } else {
      Swal({
        title:"Not Available",
        text:"There are requirements that are being registered",
        icon:"warning",
        closeOnClickOutside:false,
      })
    }
  }

  //requirement handler
  requirement_handler(id){
    var temp = []
    this.state.data.forEach(function(item_m){
      item_m.requirement.forEach(function(item_r){temp.push(item_r)})
    })
    var data = temp.filter(function(item){ return item.id === id })
    this.setState({
      requirement_modal:true,detail_id:id,
      edit_form_name:data[0]['name'],edit_form_detail:data[0]['detail'],edit_form_module:data[0]['module'],
    })
  }
  
  //requirement modal
  requirement_modal(){
    return (
      <Modal
        centered
        backdrop="static"
        keyboard={false}
        show={this.state.requirement_modal}
        onHide={()=>this.requirement_close()}
      >
        <Modal.Header closeButton>
          <Modal.Title>Requirement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form autoComplete="off">
            <Form.Group>
              <Form.Label>Module</Form.Label>
              <Form.Control id="sunting_module_req" as="select" value={this.state.edit_form_module} onChange={(e)=>this.setState({edit_form_module:e.target.value})}>
                {this.state.data.map((item,index) => {
                  return (
                    <option value={item.id.split('_')[0]} key={index}>{item.name}</option>
                  )
                })}
              </Form.Control>
              <div id="sunting_fmodule_req" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" id="sunting_name_req" value={this.state.edit_form_name} onChange={(e)=>this.setState({edit_form_name:e.target.value})}/>
              <div id="sunting_fname_req" className="invalid-feedback d-block"/>
            </Form.Group>
            <Form.Group>
              <Form.Label>Detail</Form.Label>
              <Form.Control type="text" id="sunting_detail_req" as="textarea" rows="3" value={this.state.edit_form_detail} onChange={(e)=>this.setState({edit_form_detail:e.target.value})}/>
              <div id="sunting_fdetail_req" className="invalid-feedback d-block"/>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={()=>this.requirement_delete()}
          >
            Delete
          </Button>
          <Button
            variant="primary"
            onClick={()=>this.requirement_save()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  //requirement close
  requirement_close(){
    this.setState({
      requirement_modal:false,detail_id:null,
      edit_form_name:'',edit_form_detail:'',edit_form_module:''
    })
  }

  //requirement save
  requirement_save(){
    if (this.form_validation(requirement_edit_form) === true) {
      var id = this.state.detail_id
      var edit_name = this.state.edit_form_name
      var edit_detail = this.state.edit_form_detail
      var edit_module = this.state.edit_form_module
      this.fetch({query:`
        mutation{
          requirement_edit(
            _id:"`+id.split('_')[0]+`",
            module:"`+edit_module+`",
            name:"`+edit_name+`",
            detail:"`+this.insert_replace(edit_detail)+`"
          ){_id}
        }`
      })
      var edit_change = 0
      var data = this.state.data
      var module_name = null
      data.forEach(function(module){
        module.requirement.forEach(function(requirement){
          if (requirement.id === id) {
            module_name = module.name
            if (requirement.module !== edit_module) {
              edit_change = 1
            }
          }
        })
      })
      if (edit_change === 0) {
        data.forEach(function(module){
          module.requirement.forEach(function(requirement){
            if (requirement.id === id) {
              var v_module = parseInt(module.id.split('_')[1])+1
              module.id = module.id.split('_')[0]+'_'+v_module
              requirement.name = edit_name
              requirement.detail = edit_detail
            }
          })
        })
      } else if (edit_change === 1) {
        data.forEach(function(module){
          module.requirement.forEach(function(requirement){
            if (requirement.id === id) {
              var v_module = parseInt(module.id.split('_')[1])+1
              module.id = module.id.split('_')[0]+'_'+v_module
            }
            module.requirement = module.requirement.filter(function(item){ return item.id !== id })
          })
        })
        data.forEach(function(module){
          if (module.id.split('_')[0] === edit_module) {
            module.requirement = [...module.requirement,{
              number:'-',
              id:id,
              name:edit_name,
              detail:edit_detail,
              module:edit_module
            }]
          }
        })
      }
      this.setState({data:data})
      var activity_id = RDS.generate({length:32,charset:'alphabetic'})
      var activity_code= 'R1'
      var activity_detail = edit_name+'_'+module_name
      var activity_date = new Date()
      this.fetch({query:`
        mutation {
          activity_add(
            _id:"`+activity_id+`",
            project:"`+this.state.project_id+`",
            code:"`+activity_code+`",
            detail:"`+activity_detail+`",
            date:"`+activity_date+`"
          ){_id}
        }`
      })
      this.props.activity(activity_code,activity_detail,activity_date)
      this.requirement_close()
      NotificationManager.success(success)
    }
  }

  //requirement delete
  requirement_delete(){
    Swal({
      title:"Delete",
      text:"This requirement will be deleted",
      icon:"warning",
      closeOnClickOutside:false,
      buttons:true,
      dangerMode:true,
    }).then((willDelete) => {
      if (willDelete) {
        var id = this.state.detail_id
        var data = this.state.data
        var name = null
        var module_name = null
        data.forEach(function(module){
          module.requirement.forEach(function(requirement){
            if (requirement.id === id) {
              module_name = module.name
              var v_module = parseInt(module.id.split('_')[1])+1
              module.id = module.id.split('_')[0]+'_'+v_module
              name = requirement.name
            }
            module.requirement = module.requirement.filter(function(item){ return item.id !== id })
          })
        })
        this.setState({data:data})    
        this.fetch({query:`
          mutation {
            requirement_delete(_id:"`+id.split('_')[0]+`"){_id}
          }`
        })
        var activity_id = RDS.generate({length:32,charset:'alphabetic'})
        var activity_code = 'R2'
        var activity_detail = name+'_'+module_name
        var activity_date = new Date()
        this.fetch({query:`
          mutation {
            activity_add(
              _id:"`+activity_id+`",
              project:"`+this.state.project_id+`",
              code:"`+activity_code+`",
              detail:"`+activity_detail+`",
              date:"`+activity_date+`"
            ){_id}
          }`
        })
        this.props.activity(activity_code,activity_detail,activity_date)
        this.requirement_close()
        NotificationManager.success(success)
      }
    })
  }

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Project Requirement</b>
        </Col>
        <Col className="text-right">
          <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={this.menu_add()} ref='overlay'>
            <Button
              size="sm"
              variant="outline-dark"
              disabled={this.state.header_button}
            >
              Add
            </Button>
          </OverlayTrigger>
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
        expandable={true}
        component={<ContentRequirement handler={id=>this.requirement_handler(id)}/>}
      />
    )
  }

  //render
  render() {
    return (
      <div>
        {this.add_module_modal()}
        {this.add_requirement_modal()}
        {this.requirement_modal()}
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