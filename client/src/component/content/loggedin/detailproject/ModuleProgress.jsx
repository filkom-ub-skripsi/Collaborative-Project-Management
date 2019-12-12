import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Row, Col, Button } from 'react-bootstrap'
import { RefreshCcw } from 'react-feather'
import { NotificationManager } from 'react-notifications'
import RDS from 'randomstring'
import Swal from 'sweetalert'
import LayoutCardContent from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'
import ContentRequirementProgress from './RequirementProgress'

//notification
const success = 'Your changes have been successfully saved'

//class
export default class ContentModuleProgress extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
      header_button:true,
      data:[],data_loading:true,
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
        project(_id:"`+this.state.project_id+`") {
          module {
            _id,
            name,
            detail,
            requirement {
              _id,
              name,
              detail,
              status
            }
          }
        }
      }`
    }).then(result => {
      var data = []
      result.data.project.module.forEach(function(item_m){
        var status_text = null
        var counter = 0
        var requirement = []
        item_m.requirement.forEach(function(item_r){
          if (item_r.status === '1') {
            counter++
            status_text = 'Finished'
          } else {
            status_text = 'Progress'
          }
          requirement.push({
            id:item_r._id,
            name:'['+status_text+'] '+item_r.name,
            detail:item_r.detail,
            status:item_r.status,
            module:item_m._id,
          })
        })
        var progress = Math.round(counter/requirement.length*100)
        data.push({
          id:item_m._id+'_'+0,
          name:item_m.name,
          detail:item_m.detail,
          progress:progress+'%',
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

  //progress
  progress(){
    var done = 0
    this.state.data.forEach(function(module){
      var counter = 0
      module.requirement.forEach(function(requirement){
        if (requirement.status === '1') { counter++ }
      })
      if (counter === module.requirement.length) { done++ }
    })
    this.props.progress(Math.round(done/this.state.data.length*100)+'%')
  }

  //table columns
  table_columns = [
    {name:'Requirement',selector:'name',sortable:true,width:'20%'},
    {name:'Detail',selector:'detail',sortable:true},
    {name:'Progress',selector:'progress',sortable:true,width:'10%'},
  ]

  //requirement handler
  requirement_handler(id){
    const setFinish = (id) => this.setFinish(id)
    const setUndoFinish = (id) => this.setUndoFinish(id)
    this.state.data.forEach(function(module){
      module.requirement.forEach(function(requirement){
        if (requirement.id === id) {
          if (requirement.status === '0') {
            Swal({
              title:"Finish",
              text:"This requirement will be set to finished",
              icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
            }).then((willFinish) => {
              if (willFinish) { setFinish(id) }
            })
          } else {
            Swal({
              title:"Undo Finish",
              text:"This requirement will be set to progress",
              icon:"warning",closeOnClickOutside:false,buttons:true,dangerMode:true,
            }).then((willUndoFinish) => {
              if (willUndoFinish) { setUndoFinish(id) }
            })
          }
        }
      })
    })
  }

  //set finish
  setFinish(id){
    this.fetch({
      query:`mutation {
        requirement_status(
          _id:"`+id+`",
          status:"1"
        ){_id}
      }`
    })
    var temp_id = null
    var temp_module = null
    var temp_requirement = null
    var data = this.state.data
    data.forEach(function(module){
      module.requirement.forEach(function(requirement){
        if (requirement.id === id) {
          requirement.name = '[Finished] '+requirement.name.split('] ')[1]
          requirement.status = '1'
          temp_id = module.id
          temp_module = module.name
          temp_requirement = requirement.name.split('] ')[1]
        }
      })
    })
    data.forEach(function(module){
      if (module.id === temp_id) {
        var version = parseInt(module.id.split('_')[1])+1
        module.id = module.id.split('_')[0]+'_'+version
        var counter = 0
        module.requirement.forEach(function(requirement){ if (requirement.status === '1') { counter++ } })
        module.progress = Math.round(counter/module.requirement.length*100)+'%'
      }
    })
    this.setState({data:data})
    var activity_id = RDS.generate({length:32,charset:'alphabetic'})
    var activity_code = 'R3'
    var activity_detail = temp_requirement+'_'+temp_module
    var activity_date = new Date()
    this.fetch({
      query:`mutation {
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
    this.progress()
    NotificationManager.success(success)
  }

  //set undo finish
  setUndoFinish(id){
    this.fetch({
      query:`mutation {
        requirement_status(
          _id:"`+id+`",
          status:"0"
        ){_id}
      }`
    })
    var temp_id = null
    var temp_module = null
    var temp_requirement = null
    var data = this.state.data
    data.forEach(function(module){
      module.requirement.forEach(function(requirement){
        if (requirement.id === id) {
          requirement.name = '[Progress] '+requirement.name.split('] ')[1]
          requirement.status = '0'
          temp_id = module.id
          temp_module = module.name
          temp_requirement = requirement.name.split('] ')[1]
        }
      })
    })
    data.forEach(function(module){
      if (module.id === temp_id) {
        var version = parseInt(module.id.split('_')[1])+1
        module.id = module.id.split('_')[0]+'_'+version
        var counter = 0
        module.requirement.forEach(function(requirement){ if (requirement.status === '1') { counter++ } })
        module.progress = Math.round(counter/module.requirement.length*100)+'%'
      }
    })
    this.setState({data:data})
    var activity_id = RDS.generate({length:32,charset:'alphabetic'})
    var activity_code = 'R4'
    var activity_detail = temp_requirement+'_'+temp_module
    var activity_date = new Date()
    this.fetch({
      query:`mutation {
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
    this.progress()
    NotificationManager.success(success)
  }

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Project Requirement</b>
        </Col>
        <Col className="text-right">
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
      <div className="container-detail-project">
        <LayoutTable
          noHeader={true}
          loading={this.state.data_loading}
          columns={this.table_columns}
          data={this.state.data}
          expandable={true}
          component={<ContentRequirementProgress handler={id=>this.requirement_handler(id)}/>}
        />
      </div>
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