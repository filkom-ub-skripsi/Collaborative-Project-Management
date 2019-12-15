import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Container } from 'react-bootstrap'
import JoditEditor from 'jodit-react'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'

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
      project_id:this.props.match.params.id,
      breadcrumb:breadcrumb,loading:true,content:'Loading...'
    }
  }

  //component did mount
  componentDidMount(){
    document.title = 'Document - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        name, problem, goal, objective, success, obstacle,
        client { name, contact, email, address }
        module { name, detail,
          requirement { name, detail }
        }
      }
    }`}).then(result => {
      var project = result.data.project
      var client = project.client[0]
      var reqs = project.module
      document.title = 'Document - '+project.name
      this.setState({
        breadcrumb:[...breadcrumb,{
          name:project.name,
          link:'/detail-project/'+this.state.project_id
        },{
          name:'Document',
          link:'/document/'+this.state.project_id
        }],
        loading:false,content:`
        <span style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
          <div style="font-size:18px;"><strong>`+project.name+`</strong></div>
          <div style="font-size:18px;"><strong>`+client.name+`</strong></div>
          <div>`+client.address+` - `+client.email+` / `+client.contact+`</div><hr/>
          <div style="font-size:14px;"><strong>Latar Belakang</strong></div><div>`+this.replaceNewLine(project.problem)+`</div><br/>
          <div style="font-size:14px;"><strong>Tujuan</strong></div><div>`+this.replaceNewLine(project.goal)+`</div><br/>
          <div style="font-size:14px;"><strong>Objektifitas</strong></div><div>`+this.replaceNewLine(project.objective)+`</div><br/>
          <div style="font-size:14px;"><strong>Kriteria Sukses</strong></div><div>`+this.replaceNewLine(project.success)+`</div><br/>
          <div style="font-size:14px;"><strong>Asumsi, Resiko, dan Tantangan</strong></div><div>`+this.replaceNewLine(project.obstacle)+`</div><br/>
          <table class="table table-bordered table-striped table-sm" style="width: 100%;">
            <thead>
              <tr>
	              <th style="width:2.5%;">No</td>
	              <th style="width:47.5%;">Requirement</td>
                <th style="width:50%;">Detail</td>
              </tr>
            </thead>
            <tbody>
              `+this.requirementIteration(reqs)+`
            </tbody>
          </table><hr/>
          <p></p>
        </span>
        `,
      })
    })
  }

  //replace new line
  replaceNewLine(text){
    return text.replace(/(?:\r\n|\r|\n)/g,'<br/>')
  }

  //requirement iteration
  requirementIteration(data){
    var text = ''
    data.forEach(function(module,index){
      text = text + `
        <tr>
          <td>`+(index+1)+`</td>
          <td>`+module.name+`</td>
          <td>`+module.detail+`</td>
        </tr>
      `
      module.requirement.forEach(function(requirement){
        text = text + `
        <tr>
          <td></td>
          <td>- `+requirement.name+`</td>
          <td>`+requirement.detail+`</td>
        </tr>
      `
      })
    })
    return text
  }

  //render
  render(){
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>
          <JoditEditor
            value={this.state.content}
            config={{
              readonly:this.state.loading,
              height:'84.5vh'
            }}
          />
        </Container>
      </div>
    )
  }

}