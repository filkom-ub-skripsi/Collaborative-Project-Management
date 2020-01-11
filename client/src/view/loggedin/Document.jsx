import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Container, Row, Col, Button } from 'react-bootstrap'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import LayoutCardContent from '../../component/layout/CardContent'
import Editor from 'for-editor'

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
      project_id:this.props.match.params.id,
      breadcrumb:breadcrumb,loading:true,
      content:'Loading...',
    }
    this.$vm = React.createRef()
  }

  //component did mount
  componentDidMount(){
    document.title = 'Document - Loading...'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //date reformatter
  date_reformatter(date){
    let month = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]
    let old_format = new Date(date);
    let new_format = old_format.getDate()+' '+month[old_format.getMonth()]+', '+old_format.getFullYear()
    return new_format
  }

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        name, start, end, problem, goal, objective, success, obstacle,
        client { name }, module { name, detail, 
          requirement { name, detail }
        }
      }
    }`}).then(result => {  
      document.title = 'Document - '+result.data.project.name
      let project = result.data.project
      let client = project.client[0]
      let requirement = ''
      project.module.forEach(function(mod,index){
        requirement += '\n| **'+(index + 1)+'** | **'+mod.name+'** | **'+mod.detail+'** |'
        mod.requirement.forEach(function(req){
          requirement += '\n|  | - '+req.name+' | '+req.detail+' |'
        })
      })
      let content = 
      `##### `+project.name+
      `\n###### `+client.name+
      `\n###### `+this.date_reformatter(project.start)+` - `+this.date_reformatter(project.end)+
      `\n---`+
      `\n###### Latar Belakang\n>`+project.problem+
      `\n###### Tujuan\n>`+project.goal+
      `\n###### Objektifitas\n>`+project.objective+
      `\n###### Kriteria Sukses\n>`+project.success+
      `\n###### Asumsi, Resiko, dan Hambatan\n>`+project.obstacle+
      `\n---`+
      `\n| No | Requirement | Detail |`+
      `\n| --- | --- | --- |`+requirement+
      `\n\n---`
      this.setState({
        loading:false,content:content,
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

  //content handler
  contentHanlder(content){
    this.setState({content:content})
  }

  //content image
  addImg($file) {
    this.$vm.current.$img2Url($file.name,'file_url')
  }

  //card header
  card_header(){
    return (
      <Row>
        <Col>
          <b style={{fontSize:20}}>Preview</b>
        </Col>
        <Col className="text-right">
          <Button
            size="sm" variant="outline-dark"
            disabled={this.state.loading}
            onClick={()=>console.log('test')}
          >
            Download
          </Button>
        </Col>
      </Row>
    )
  }

  //card body
  card_body(){
    return (
      <Editor
        value={this.state.content} onChange={(e)=>this.contentHanlder(e)}
        ref={this.$vm} addImg={($file) => this.addImg($file)}
        preview={true} subfield={true} expand={false} height='78vh' language='en'
      />
    )
  }

  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={this.state.breadcrumb}/>
        <Container fluid>
          <LayoutCardContent
            header={this.card_header()}
            body={this.card_body()}
            table={true}
          />
        </Container>
      </div>
    )
  }
}