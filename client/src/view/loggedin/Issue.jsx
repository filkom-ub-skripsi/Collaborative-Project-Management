import React from 'react'
import { Container } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentIssue from '../../component/content/loggedin/issue/Issue'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'}
]

//class
export default class ViewIssue extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:null,issue_id:this.props.match.params.id,comment:[],myName:null,breadcrumb:breadcrumb,loading:'disabled',module:[],requirement:[],
      data:{name:null,detail:null,requirement:null,requirement_id:null,module:null,module_id:null,employee:null,employee_id:null,status:null},
    }
    this.reload = this.reload.bind(this)
    this.save = this.save.bind(this)
    this.commentHandler = this.commentHandler.bind(this)
    this.commentDelete = this.commentDelete.bind(this)
  }

  //component did mount
  componentDidMount(){
    document.title = 'Issue - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    //issue
    this.fetch({query:`{
      issue(_id:"`+this.state.issue_id+`") {
        _id, name, detail, status,
        requirement { _id, name,
          module { _id, name }
        }
        employee { _id, name },
        comment { _id, comment,
          employee { _id, name }
        },
        project { _id, name },
      }
    }`}).then(result => {
      document.title = 'Issue - '+result.data.issue.name
      this.requirement(result.data.issue.project[0]['_id'])
      var comment = []
      result.data.issue.comment.forEach(function(item){
        comment.push({
          id:item._id,
          employee:item.employee[0]['name'],
          employee_id:item.employee[0]['_id'],
          comment:item.comment
        })
      })
      this.setState({
        project_id:result.data.issue.project[0]['_id'],
        breadcrumb:[...breadcrumb,{
          name:result.data.issue.project[0]['name'],
          link:'/detail-project/'+result.data.issue.project[0]['_id'],
        },{
          name:result.data.issue.name,
          link:'/issue/'+this.state.issue_id
        }],
        data:{
          name:result.data.issue.name,
          detail:result.data.issue.detail,
          requirement:result.data.issue.requirement[0]['name'],
          requirement_id:result.data.issue.requirement[0]['_id'],
          module:result.data.issue.requirement[0]['module'][0]['name'],
          module_id:result.data.issue.requirement[0]['module'][0]['_id'],
          employee:result.data.issue.employee[0]['name'],
          employee_id:result.data.issue.employee[0]['_id'],
          status:result.data.issue.status,
        },
        comment:comment,
        loading:''
      })
    })
    //name
    this.fetch({query:'{employee(_id:"'+localStorage.getItem('user')+'"){name}}'})
    .then(result => { this.setState({myName:result.data.employee.name}) })
  }

  //requirement
  requirement(project_id){
    this.fetch({query:`{
      project(_id:"`+project_id+`"){
        module { _id, name, 
          requirement { _id, name }
        }
      }
    }`})
    .then(result => {
      var module = []
      var requirement = []
      result.data.project.module.forEach(function(item_module){
        module.push({
          id:item_module._id,
          name:item_module.name
        })
        item_module.requirement.forEach(function(item_requirement){
          requirement.push({
            id:item_requirement._id,
            name:item_requirement.name,
            module:item_module.name,
            module_id:item_module._id
          })
        })
      })
      this.setState({
        module:module,
        requirement:requirement
      })
    })
  }

  //reload
  reload(){
    this.setState({loading:'disabled'})
    this.push()
  }

  //replace \n
  insert_replace(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'\\n')
  }

  //save
  save(name,detail,requirement){
    this.fetch({query:`mutation {
      issue_edit(
        _id:"`+this.state.issue_id+`",
        name:"`+name+`",
        detail:"`+this.insert_replace(detail)+`",
        requirement:"`+requirement+`"
      ){_id}
    }`})
    this.fetch({query:`mutation {
      activity_add(
        _id:"`+this.props.objectId()+`",
        project:"`+this.state.project_id+`",
        code:"S1",
        detail:"`+name+`",
        date:"`+new Date()+`"
      ){_id}
    }`})
    var data_requirement = this.state.requirement.filter(function(item){ return item.id === requirement })
    var data = this.state.data
    data.name = name
    data.detail = detail
    data.module = data_requirement[0]['module']
    data.module_id = data_requirement[0]['module_id']
    data.requirement = data_requirement[0]['name']
    data.requirement_id = data_requirement[0]['id']
    this.setState({
      data:data,
      breadcrumb:[...this.state.breadcrumb.splice(0,3),{
        name:name,
        link:'/issue/'+this.state.issue_id
      }]
    })
  }

  //comment handler
  commentHandler(comment){
    var id = this.props.objectId()
    this.fetch({query:`mutation {
      comment_add(
        _id:"`+id+`",
        issue:"`+this.state.issue_id+`",
        employee:"`+localStorage.getItem('user')+`",
        comment:"`+comment+`"
      ){_id}
    }`})
    this.setState({
      comment:[...this.state.comment,{
        id:id+'_'+0,
        employee:this.state.myName,
        employee_id:localStorage.getItem('user'),
        comment:comment,
      }]
    })
  }

  //comment delete
  commentDelete(id){
    this.fetch({query:`mutation {
      comment_delete(_id:"`+id+`"){_id}
    }`})
    var comment = this.state.comment.filter(function(item){ return item.id !== id })
    this.setState({comment:comment})
  }

  //render
  render(){
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container>
          <ContentIssue
            loading={this.state.loading}
            module={this.state.module}
            requirement={this.state.requirement}
            data={this.state.data}
            comment={this.state.comment}
            reload={this.reload}
            save={this.save}
            commentHandler={this.commentHandler}
            commentDelete={this.commentDelete}
          />
        </Container>
      </div>
    )
  }
  
}