import React from 'react'
import { createApolloFetch } from 'apollo-fetch'
import { Box, Trash, Plus, Edit2, Check, X, UserPlus, UserX, UserCheck, UserMinus, AlertCircle, Clipboard } from 'react-feather'
import { Timeline, TimelineEvent } from 'react-event-timeline'

const color = {
  green:'rgb(60,179,113)',blue:'rgb(70,130,180)',orange:'rgb(255,127,80)',red:'rgb(178,34,34)'
}
const size = 18

//class
export default class ContentActivity extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      project_id:this.props.id,
    }
  }

  //component did mound
  componentDidMount(){
    this.push()
  }

  //fetch
  fetch = createApolloFetch({uri:this.props.webservice})

  //push
  push(){
    this.fetch({query:`{
      project(_id:"`+this.state.project_id+`") {
        activity { code, detail, date },
      }
    }`}).then(result => {
      this.props.update(result.data.project.activity)
    })
  }

  //render
  render() {
    let temp = this.props.data
    let data = []
    for (let i = temp.length - 1 ; i >= 0 ; i-- ) {
      if (temp[i]['code'] === 'P0') {
        data.push({
          date:temp[i]['date'],
          detail:'This project is created',
          icon:<Box size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'P1') {
        data.push({
          date:temp[i]['date'],
          detail:'Project overview is updated',
          icon:<Box size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'P2') {
        data.push({
          date:temp[i]['date'],
          detail:'Project agreement is edited',
          icon:<Box size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'P3') {
        data.push({
          date:temp[i]['date'],
          detail:'Project is started',
          icon:<Box size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'M0') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is added',
          icon:<Plus size={size}/>,iconColor:color.blue
        })
      } else if (temp[i]['code'] === 'M1') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is edited',
          icon:<Edit2 size={size}/>,iconColor:color.orange
        })
      } else if (temp[i]['code'] === 'M2') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is deleted',
          icon:<Trash size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'R0') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' is added for '+temp[i]['detail'].split('_')[1]+' module',
          icon:<Plus size={size}/>,iconColor:color.blue
        })
      } else if (temp[i]['code'] === 'R1') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is edited',
          icon:<Edit2 size={size}/>,iconColor:color.orange
        })
      } else if (temp[i]['code'] === 'R2') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is deleted',
          icon:<Trash size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'R3') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is finished',
          icon:<Check size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'R4') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' is back to progress',
          icon:<X size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'I0') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division is invited to this project',
          icon:<UserPlus size={size}/>,iconColor:color.blue
        })
      } else if (temp[i]['code'] === 'I1') {
        data.push({
          date:temp[i]['date'],
          detail:'Invitation for '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division is cancelled',
          icon:<UserMinus size={size}/>,iconColor:color.orange
        })
      } else if (temp[i]['code'] === 'I2') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division accepted the invitation',
          icon:<UserCheck size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'I3') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division declined the invitation',
          icon:<UserX size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'I4') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from the '+temp[i]['detail'].split('_')[1]+' division is kicked',
          icon:<UserX size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'S0') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue from requirement '+temp[i]['detail'].split('_')[1]+' of '+temp[i]['detail'].split('_')[2]+' module is added by '+temp[i]['detail'].split('_')[3],
          icon:<AlertCircle size={size}/>,iconColor:color.blue
        })
      } else if (temp[i]['code'] === 'S1') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue is edited',
          icon:<AlertCircle size={size}/>,iconColor:color.orange
        })
      } else if (temp[i]['code'] === 'S2') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue is resolved',
          icon:<AlertCircle size={size}/>,iconColor:color.green
        })
      } else if (temp[i]['code'] === 'S3') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue is back to unsolved',
          icon:<AlertCircle size={size}/>,iconColor:color.red
        })
      } else if (temp[i]['code'] === 'B0') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail']+' is added to backlog',
          icon:<Clipboard size={size}/>,iconColor:color.blue
        })
      } else if (temp[i]['code'] === 'B1') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail']+' is deleted from backlog',
          icon:<Clipboard size={size}/>,iconColor:color.red
        })
      }
    }
    return (
      <div className="container-activity">
        <Timeline>
          {
            data.map((item,index) => {
              return (
                <TimelineEvent
                  title={<b>{item.date}</b>}
                  createdAt={<h6>{item.detail}</h6>}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  key={index}
                />
              )
            })
          }
        </Timeline>
      </div>
    )
  }
  
}