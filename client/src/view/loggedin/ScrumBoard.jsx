import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import Board from 'react-trello'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'}
]

const TYPE0 = 'Requirement'
const TYPE1 = 'Issue'

//class
export default class ViewScrumBoard extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      sprint_id:this.props.match.params.id,
      breadcrumb:breadcrumb,data:{lanes:[]},
      project_id:null
    }
  }

  //component did mount
  componentDidMount(){
    document.title = 'Scrum Board - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      sprint(_id:"`+this.state.sprint_id+`") {
        project { _id, name }
        task { _id, status,
          requirement { _id, name, detail },
          issue { _id, name, detail }
        }
      }
    }`}).then(result => {
      let project = result.data.sprint.project[0]
      let task = result.data.sprint.task
      document.title = 'Scrum Board - ' + project.name
      let tempName = ['backlog','todo','progress','done']
      let tempData = {backlog:[],todo:[],progress:[],done:[]}
      task.forEach(function(item){
        let data = {}
        data.id = item._id
        if (item.requirement.length !== 0) {
          data.title = item.requirement[0]['name']
          data.description = item.requirement[0]['detail']
          data.label = TYPE0
          data.taskId = item.requirement[0]['_id']
        } else if (item.issue.length !== 0) {
          data.title = item.issue[0]['name']
          data.description = item.issue[0]['detail']
          data.label = TYPE1
          data.taskId = item.issue[0]['_id']
        }
        if (item.status === '0') { tempData.backlog.push(data) }
        else if (item.status === '1') { tempData.todo.push(data) }
        else if (item.status === '2') { tempData.progress.push(data) }
        else if (item.status === '3') { tempData.done.push(data) }
      })
      let scrumboard = {
        lanes: [
          {id:'0',title:'Backlog',cards:[]},
          {id:'1',title:'To Do',cards:[]},
          {id:'2',title:'Progress',cards:[]},
          {id:'3',title:'Done',cards:[]},
        ]
      }
      scrumboard.lanes.forEach(function(item,index){
        item.cards = tempData[tempName[index]]
      })
      this.setState({
        data:scrumboard,project_id:project._id,
        breadcrumb:[...breadcrumb,{
          name:project.name,
          link:'/detail-project/'+project._id
        },{
          name:'Scrum Board',
          link:'/scrum-board/'+this.state.sprint_id
        }]
      })
    })
  }

  //change handler
  changeHandler(before,after,id){
    if (before !== after) {
      this.fetch({query:`mutation {
        task_status(_id:"`+id+`",status:"`+after+`"){_id}
      }`})
      if (after === '3') {
        let data = null
        this.state.data.lanes.forEach(function(item){
          item.cards.forEach(function(push){
            if (push.id === id) { data = push }
          })
        })
        if (data.label === TYPE0) {
          this.fetch({query:`mutation {
            requirement_status(_id:"`+data.taskId+`",status:"1"){_id}
          }`})
          this.fetch({query:`
            mutation {
              activity_add(
                _id:"`+this.props.objectId()+`",
                project:"`+this.state.project_id+`",
                code:"R3",detail:"`+data.title+`",
                date:"`+new Date()+`"
              ){_id}
            }`
          })
        } else if (data.label === TYPE1) {
          this.fetch({query:`mutation {
            issue_status(_id:"`+data.taskId+`",status:"1"){_id}
          }`})
          this.fetch({query:`
            mutation {
              activity_add(
                _id:"`+this.props.objectId()+`",
                project:"`+this.state.project_id+`",
                code:"S2",detail:"`+data.title+`",
                date:"`+new Date()+`"
              ){_id}
            }`
          })
        }
      }
      if (before === '3') {
        let data = null
        this.state.data.lanes.forEach(function(item){
          item.cards.forEach(function(push){
            if (push.id === id) { data = push }
          })
        })
        if (data.label === TYPE0) {
          this.fetch({query:`mutation {
            requirement_status(_id:"`+data.taskId+`",status:"0"){_id}
          }`})
          this.fetch({query:`
            mutation {
              activity_add(
                _id:"`+this.props.objectId()+`",
                project:"`+this.state.project_id+`",
                code:"R4",detail:"`+data.title+`",
                date:"`+new Date()+`"
              ){_id}
            }`
          })
        } else if (data.label === TYPE1) {
          this.fetch({query:`mutation {
            issue_status(_id:"`+data.taskId+`",status:"0"){_id}
          }`})
          this.fetch({query:`
            mutation {
              activity_add(
                _id:"`+this.props.objectId()+`",
                project:"`+this.state.project_id+`",
                code:"S3",detail:"`+data.title+`",
                date:"`+new Date()+`"
              ){_id}
            }`
          })
        }
      }
    }
  }

  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Board
          data={this.state.data} onCardMoveAcrossLanes={(before,after,id)=>this.changeHandler(before,after,id)}
          style={{backgroundColor:'#f0f0f0',height:'83.5vh',paddingLeft:20,paddingRight:20}}
          hideCardDeleteIcon
        />
      </div>
    )
  }

}