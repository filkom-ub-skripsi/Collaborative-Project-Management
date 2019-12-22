import React from 'react'
import { NotificationManager } from 'react-notifications'
import { createApolloFetch } from 'apollo-fetch'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentGanttChart from '../../component/content/loggedin/ganttchart/GanttChart'

//breadcrumb
const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'},
]

//color
const ganttColor = {
  parent:"#3CB371",
  child:"#3DBAD3"
}

//class
export default class ViewGanttChart extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.match.params.id,
      data:[],links:[],breadcrumb:breadcrumb
    }
    this.add = this.add.bind(this)
    this.edit = this.edit.bind(this)
    this.delete = this.delete.bind(this)
  }

  //component did mount
  componentDidMount(){
    document.title = 'Gantt Chart - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        name,
        gantt { _id, name, start, duration, parent }
      }
    }`}).then(result => {
      document.title = 'Gantt Chart - '+result.data.project.name
      const objectId = () => { return this.props.objectId() }
      var data = []
      var links = []
      result.data.project.gantt.forEach(function(item){
        var links_id = objectId()
        var parent = null
        var color = ganttColor.parent
        if (item.parent !== '') {
          parent = item.parent
          color = ganttColor.child
          links.push({
            id:links_id,source:item.parent,
            target:item._id,type:"1"
          })
        }
        data.push({
          id:item._id,text:item.name,start_date:item.start,
          duration:item.duration,parent:parent,color:color
        })
      })
      this.setState({
        data:data,links:links,
        breadcrumb:[...breadcrumb,{
          name:result.data.project.name,
          link:'/detail-project/'+this.state.project_id
        },{
          name:'Gantt Chart',
          link:'/gantt-chart/'+this.state.project_id
        }]
      })
    })
  }

  //add
  add(item){
    var parent = ''
    if (item.parent !== 0){
      parent = item.parent
      var links_id = this.props.objectId()
      this.setState({
        data:[...this.state.data,{
          id:item.id,text:item.text,start_date:item.start_date,
          duration:item.duration,parent:parent,color:ganttColor.child
        }],
        links:[...this.state.links,{
          id:links_id,source:item.parent,
          target:item.id,type:"1"
        }]
      })
    } else {
      this.setState({
        data:[...this.state.data,{
          id:item.id,text:item.text,start_date:item.start_date,
          duration:item.duration,parent:null,color:ganttColor.parent
        }],
        links:this.state.links
      })
    }
    this.fetch({query:`mutation {
      gantt_add(
        _id:"`+item.id+`",
        project:"`+this.state.project_id+`",
        name:"`+item.text+`",
        start:"`+item.start_date+`",
        duration:"`+item.duration+`",
        parent:"`+parent+`"
      ){_id}
    }`})
    NotificationManager.success(item.text+' successfully added')
  }

  //edit
  edit(item){
    this.fetch({query:`mutation {
      gantt_edit(
        _id:"`+item.id+`",
        name:"`+item.text+`",
        start:"`+item.start_date+`",
        duration:"`+item.duration+`",
      ){_id}
    }`})
  }

  //delete
  delete(item){
    this.fetch({query:`mutation {
      gantt_delete(_id:"`+item.id+`"){_id}
    }`})
    if (item.text !== undefined) {
      NotificationManager.success(item.text+' successfully deleted')
    }
  }

  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>
          <ContentGanttChart
            data={this.state.data}
            links={this.state.links}
            add={this.add}
            edit={this.edit}
            delete={this.delete}
          />
        </Container>
      </div>
    )
  }

}