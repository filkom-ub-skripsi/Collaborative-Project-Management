import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Row, Col, Button } from 'react-bootstrap'
import { RefreshCcw } from 'react-feather'
import { Link } from 'react-router-dom'
import LayoutCardContent from '../../../layout/CardContent'
import LayoutTable from '../../../layout/Table'
import ContentRequirementProgress from './RequirementProgress'

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
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        module { _id, name, detail,
          requirement { _id, name, detail, status }
        }
      }
    }`}).then(result => {
      this.props.update(result.data.project.module)
      let data = []
      result.data.project.module.forEach(function(item_m){
        let status_text = null
        let counter = 0
        let requirement = []
        item_m.requirement.forEach(function(item_r,index_r){
          if (item_r.status === '1') {
            counter++
            status_text = 'Finished'
          } else {
            status_text = 'Progress'
          }
          requirement.push({
            id:item_r._id,
            name:item_r.name,
            detail:item_r.detail,
            progress:status_text,
            status:item_r.status,
            module:item_m._id,
            number:index_r+1+'.'
          })
        })
        let progress = Math.round(counter/requirement.length*100)
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

  //table columns
  table_columns = [
    {name:'Requirement',selector:'name',sortable:true,width:'20%'},
    {name:'Detail',selector:'detail',sortable:true},
    {name:'Progress',selector:'progress',sortable:true,width:'10%'},
  ]

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Project Requirement</b>
        </Col>
        <Col className="text-right">
          <Link
            to={'/gantt-chart/'+this.state.project_id}
            className="btn btn-sm btn-outline-dark"
          >
            Gantt Chart
          </Link>
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
        component={<ContentRequirementProgress/>}
      />
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