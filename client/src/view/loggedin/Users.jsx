import React from 'react'
import RDS from 'randomstring'
import MD5 from 'md5'
import { Container, Tabs, Tab } from 'react-bootstrap'
import { createApolloFetch } from 'apollo-fetch'
import LayoutBreadcrumb from '../../component/layout/Breadcrumb'
import ContentDivision from '../../component/content/loggedin/user/Division'
import ContentEmployee from '../../component/content/loggedin/user/Employee'

//breadcrumb
const breadcrumb = [
	{name:'Setting',link:'#!'},
	{name:'Users',link:'/users'}
]

//leader
const leader_id = 'leader'
const leader_name = 'Leader of Organization'

//class
export default class ViewUsers extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = { data:[], loading:true }
    this.reload = this.reload.bind(this)
    this.division_add = this.division_add.bind(this)
    this.division_edit = this.division_edit.bind(this)
    this.division_delete = this.division_delete.bind(this)
    this.employee_add = this.employee_add.bind(this)
    this.employee_edit = this.employee_edit.bind(this)
    this.employee_reset = this.employee_reset.bind(this)
    this.employee_delete = this.employee_delete.bind(this)
  }

  //component did mount
  componentDidMount(){
    document.title = 'Users'
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      organization(_id:"`+localStorage.getItem('organization')+`") {
        leader {
          leader {
            _id,
            name,
            email,
            contact
            project {
              code,
              name,
              status,
              employee {
                name
              },
              module {
                requirement {
                  status
                }
              }
            },
            collaborator {
              project {
                code,
                name,
                status,
                employee {
                  name
                },
                module {
                  requirement {
                    status
                  }
                }
              },
              status
            }
          }
        }
        division {
          _id,
          name,
          employee {
            _id,
            name,
            email,
            contact,
            project {
              code,
              name,
              status,
              employee {
                name
              },
              module {
                requirement {
                  status
                }
              }
            },
            collaborator {
              project {
                code,
                name,
                status,
                employee {
                  name
                },
                module {
                  requirement {
                    status
                  }
                }
              },
              status
            }
          }
        }
      }
    }`}).then(result => {
      var data = []
      result.data.organization.leader.forEach(function(item_d){
        var employee = []
        item_d.leader.forEach(function(item_e){
          var data = []
          var l_proj = item_e.project
          var l_coll = item_e.collaborator.filter(function(filter){ return filter.status === '1' })
          l_coll.forEach(function(item){ data = data.concat(item.project) })
          data = data.concat(l_proj)
          employee.push({
            id:item_e._id+'_'+0,
            name:item_e.name,
            email:item_e.email,
            contact:item_e.contact,
            division_id:leader_id,
            division_name:leader_name,
            project:l_proj.length+l_coll.length,
            data:data
          })
        })
        data.push({
          id:leader_id,
          name:leader_name,
          member:1,
          employee:employee
        })
      })
      result.data.organization.division.forEach(function(item_d){
        var employee = []
        item_d.employee.forEach(function(item_e){
          var data = []
          var l_proj = item_e.project
          var l_coll = item_e.collaborator.filter(function(filter){ return filter.status === '1' })
          l_coll.forEach(function(item){ data = data.concat(item.project) })
          data = data.concat(l_proj)
          employee.push({
            id:item_e._id+'_'+0,
            name:item_e.name,
            email:item_e.email,
            contact:item_e.contact,
            division_id:item_d._id,
            division_name:item_d.name,
            project:l_proj.length+l_coll.length,
            data:data
          })
        })
        data.push({
          id:item_d._id+'_'+0,
          name:item_d.name,
          member:item_d.employee.length,
          employee:employee
        })
      })
      this.setState({
        data:data,
        loading:false,
      })
    })
  }

  //reload
  reload(){
    this.setState({loading:true})
    this.push()
  }

  //division
  division(){
    return (
      <ContentDivision
        webservice={this.props.webservice}
        leader={leader_id}
        data={this.state.data}
        loading={this.state.loading}
        reload={this.reload}
        add={this.division_add}
        edit={this.division_edit}
        delete={this.division_delete}
      />
    )
  }

  //division add
  division_add(name){
    var id = RDS.generate({length:32,charset:'alphabetic'})
    this.fetch({query:`
      mutation {
        division_add(
          _id:"`+id+`",
          organization:"`+localStorage.getItem('organization')+`",
          name:"`+name+`"
        ){_id}
      }`
    })
    this.setState({
      data: [...this.state.data,{
        id:id+'_'+0,name:name,member:0,employee:[]
      }]
    })
  }

  //division edit
  division_edit(id,newName){
    this.fetch({query:`
      mutation {
        division_edit(
          _id:"`+id.split('_')[0]+`",
          name:"`+newName+`"
        ){_id}
      }`
    })
    var data = this.state.data
    data.forEach(function(item){
      if (item.id === id) {
        var version = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+version
        item.name = newName
      }
    })
    this.setState({data:data})
  }

  //division delete
  division_delete(id){
    this.fetch({query:`
      mutation {
        division_delete(_id:"`+id.split('_')[0]+`"){_id}
      }`
    })
    var data = this.state.data.filter(function(item){return(item.id!==id)})
    this.setState({data:data})
  }

  //employee
  employee(){
    return (
      <ContentEmployee
        webservice={this.props.webservice}
        leader={leader_id}
        data={this.state.data}
        loading={this.state.loading}
        reload={this.reload}
        add={this.employee_add}
        edit={this.employee_edit}
        reset={this.employee_reset}
        delete={this.employee_delete}
      />
    )
  }

  //employee add
  employee_add(name,email,contact,division){
    var id = RDS.generate({length:32,charset:'alphabetic'})
    this.fetch({query:`
      mutation {
        employee_add(
          _id:"`+id+`",
          password:"`+MD5('1234')+`",
          organization:"`+localStorage.getItem('organization')+`",
          division:"`+division.split('_')[0]+`",
          name:"`+name+`",
          email:"`+email+`",
          contact:"`+contact+`",
        ){_id}
      }`
    })
    var data = this.state.data
    data.forEach(function(item_d){
      if (item_d.id === division) {
        var version = parseInt(item_d.id.split('_')[1])+1
        item_d.id = item_d.id.split('_')[0]+'_'+version
        item_d.member = item_d.member + 1
        item_d.employee = [...item_d.employee,{
          id:id+'_'+0,
          name:name,
          email:email,
          contact:contact,
          division_id:item_d.id.split('_')[0],
          division_name:item_d.name,
          project:0
        }]
      }
    })
    this.setState({data:data})
  }

  //employee edit
  employee_edit(id,oldDivision,newDivision){
    this.fetch({query:`
      mutation {
        employee_edit(
          _id:"`+id.split('_')[0]+`",
          division:"`+newDivision+`"
        ){_id}
      }`
    })
    var temp = []
    var data = this.state.data
    data.forEach(function(item){
      if (item.id.split('_')[0] === oldDivision) {
        var minVersion = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+minVersion
        item.member = item.member - 1
        temp = item.employee.filter(function(filter){ return filter.id === id })
        var employee = item.employee.filter(function(filter){ return filter.id !== id })
        item.employee = employee
      }
    })
    data.forEach(function(item){
      if (item.id.split('_')[0] === newDivision) {
        var addVersionDivision = parseInt(item.id.split('_')[1])+1
        item.id = item.id.split('_')[0]+'_'+addVersionDivision
        item.member = item.member + 1
        var addVersionEmployee = parseInt(temp[0]['id'].split('_')[1])+1
        temp[0]['id'] = temp[0]['id'].split('_')[0]+'_'+addVersionEmployee
        temp[0]['division_id'] = item.id.split('_')[0]
        temp[0]['division_name'] = item.name
        item.employee = [...item.employee,temp[0]]
      }
    })
    this.setState({data:data})
  }

  //employee reset
  employee_reset(id){
    this.fetch({query:`
      mutation {
        employee_edit(
          _id:"`+id.split('_')[0]+`",
          password:"`+MD5('1234')+`"
        ){_id}
      }`
    })
  }

  //employee delete
  employee_delete(id){
    const fetch = (query) => this.fetch({query:query})
    this.fetch({query:`{
      employee(_id:"`+id.split('_')[0]+`") {
        collaborator {_id}
      }
    }`}).then(result => {
      result.data.employee.collaborator.forEach(function(item){
        fetch(`mutation{collaborator_delete(_id:"`+item._id+`"){_id}}`)
      })
      fetch(`mutation{employee_delete(_id:"`+id.split('_')[0]+`"){_id}}`)
    })
    var data = this.state.data
    data.forEach(function(item_d){
      item_d.employee.forEach(function(item_e){
        if (item_e.id === id) {
          var version = parseInt(item_d.id.split('_')[1])+1
          item_d.id = item_d.id.split('_')[0]+'_'+version
          item_d.member = item_d.member - 1
          var employee = item_d.employee.filter(function(filter){ return filter.id !== id })
          item_d.employee = employee
        }
      })
    })
    this.setState({data:data})
  }

  //render
  render() {
    return (
      <div>
        <LayoutBreadcrumb breadcrumb={breadcrumb}/>
        <Container fluid>
          <Tabs defaultActiveKey="TAB1">
            <Tab eventKey="TAB1" title="Division">
              {this.division()}
            </Tab>
            <Tab eventKey="TAB2" title="Employee">
              {this.employee()}
            </Tab>
          </Tabs>
        </Container>
      </div>
    )
  }

}