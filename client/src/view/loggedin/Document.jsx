import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Container } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import JoditEditor from 'jodit-react'

const breadcrumb = [
	{name:'Main',link:'#!'},
	{name:'Projects',link:'/projects'},
]

//class
export default class ViewDocument extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.match.params.id,breadcrumb:breadcrumb,
      content:'Loading...',config:{height:'83.5vh'}
    }
    this.editor = React.createRef()
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
        client { name }, module { name, detail, 
          requirement { name, detail }
        }
      }
    }`}).then(result => {  
      document.title = 'Document - '+result.data.project.name
      let project = result.data.project
      let client = project.client[0]
      console.log(project.objective)
      console.log(project.objective.replace('\n','<br/>'))
      let table = ``
      project.module.forEach(function(module,im){
        table += 
        `<tr>`+
          `<td>`+(im + 1)+`</td><td>`+module.name+`</td>`+
          `<td>`+module.detail+`</td>`+
        `</tr>`
        module.requirement.forEach(function(requirement){
          table += 
          `<tr>`+
            `<td></td><td>`+requirement.name+`</td>`+
            `<td>`+requirement.detail+`</td>`+
          `</tr>`
        })
      })
      let content = 
      `<style>
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #dddddd; text-align:left; padding:5px; }
      </style>`+
      `<span style="font-family:Helvetica,sans-serif;">`+
        `<strong style="font-size:18px">`+project.name+`</strong><br/>`+
        `<strong style="font-size:18px">`+client.name+`</strong><br/><hr/>`+
        `<p style="font-size:16px"><strong>Latar Belakang</strong></p><p style="text-align:justify">`+project.problem.replace(/(?:\r\n|\r|\n)/g, '<br>')+`</p>`+
        `<p style="font-size:16px"><strong>Tujuan</strong></p><p style="text-align:justify">`+project.goal.replace(/(?:\r\n|\r|\n)/g, '<br>')+`</p>`+
        `<p style="font-size:16px"><strong>Objektifitas</strong></p><p style="text-align:justify">`+project.objective.replace(/(?:\r\n|\r|\n)/g, '<br>')+`</p>`+
        `<p style="font-size:16px"><strong>Kriteria Sukses</strong></p><p style="text-align:justify">`+project.success.replace(/(?:\r\n|\r|\n)/g, '<br>')+`</p>`+
        `<p style="font-size:16px"><strong>Asumsi, Resiko, dan Hambatan</strong></p><p style="text-align:justify">`+project.obstacle.replace(/(?:\r\n|\r|\n)/g, '<br>')+`</p>`+
        `<table>`+
          `<tbody><tr>`+
            `<td style="width:5%"><strong>No</strong></td><td style="width:45%"><strong>Requirement</strong></td>`+
            `<td style="width:50%"><strong>Detail</strong></td>`+
          `</tr>`+table+`</tbody>`+
        `</table><hr/>`+
        `<span>Catatan tambahan : </span><br/><span>...</span>`+
      `</span>`
      this.setState({
        content:content,
        breadcrumb:[...breadcrumb,{
          name:project.name,
          link:'/detail-project/'+this.state.project_id,
        },{
          name:'Document',
          link:'/document/'+this.state.project_id
        }]
      })
    })
  }
  
  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container>
          <JoditEditor
            ref={this.editor} config={this.state.config}
            value={this.state.content} onBlur={(e)=>this.setState({content:e})}
          />
        </Container>
      </div>
    )
  }
}