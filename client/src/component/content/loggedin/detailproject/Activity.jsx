import React from 'react'
import { Box, Trash, Plus, Edit2, Check, X, UserPlus, UserX, UserCheck, UserMinus, AlertCircle } from 'react-feather'
import { Timeline, TimelineEvent } from 'react-event-timeline'

//class
export default class ContentActivity extends React.Component {

  //render
  render() {
    var size = 18
    var temp = this.props.data
    var data = []
    for (var i = temp.length - 1 ; i >= 0 ; i-- ) {
      if (temp[i]['code'] === 'P0') {
        data.push({
          date:temp[i]['date'],
          detail:'This project is created',
          type:0
        })
      } else if (temp[i]['code'] === 'P1') {
        data.push({
          date:temp[i]['date'],
          detail:'Project overview is updated',
          type:0
        })
      } else if (temp[i]['code'] === 'P2') {
        data.push({
          date:temp[i]['date'],
          detail:'Project agreement is edited',
          type:0
        })
      } else if (temp[i]['code'] === 'P3') {
        data.push({
          date:temp[i]['date'],
          detail:'Project is started',
          type:0
        })
      } else if (temp[i]['code'] === 'M0') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is added',
          type:1
        })
      } else if (temp[i]['code'] === 'M1') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is edited',
          type:2
        })
      } else if (temp[i]['code'] === 'M2') {
        data.push({
          date:temp[i]['date'],
          detail:'Module '+temp[i]['detail']+' is deleted',
          type:3
        })
      } else if (temp[i]['code'] === 'R0') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' is added for '+temp[i]['detail'].split('_')[1]+' module',
          type:1
        })
      } else if (temp[i]['code'] === 'R1') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is edited',
          type:2
        })
      } else if (temp[i]['code'] === 'R2') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is deleted',
          type:3
        })
      } else if (temp[i]['code'] === 'R3') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' module is finished',
          type:4
        })
      } else if (temp[i]['code'] === 'R4') {
        data.push({
          date:temp[i]['date'],
          detail:'Requirement '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' is back to progress',
          type:5
        })
      } else if (temp[i]['code'] === 'I0') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division is invited to this project',
          type:6
        })
      } else if (temp[i]['code'] === 'I1') {
        data.push({
          date:temp[i]['date'],
          detail:'Invitation for '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division is cancelled',
          type:7
        })
      } else if (temp[i]['code'] === 'I2') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division accepted the invitation',
          type:8
        })
      } else if (temp[i]['code'] === 'I3') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division declined the invitation',
          type:9
        })
      } else if (temp[i]['code'] === 'I4') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' from the '+temp[i]['detail'].split('_')[1]+' division is kicked',
          type:9
        })
      } else if (temp[i]['code'] === 'S0') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue is added by '+temp[i]['detail'].split('_')[1],
          type:10
        })
      } else if (temp[i]['code'] === 'S1') {
        data.push({
          date:temp[i]['date'],
          detail:temp[i]['detail'].split('_')[0]+' issue is edited by '+temp[i]['detail'].split('_')[1],
          type:11
        })
      }
    }
    return (
      <div className="container-activity">
        <Timeline>
          {
            data.map((item,index) => {
              var icon = null
              var iconColor = null
              if (item.type === 0) {
                icon = <Box size={size}/>
                iconColor = 'rgb(60,179,113)'
              } else if (item.type === 1) {
                icon = <Plus size={size}/>
                iconColor = 'rgb(70,130,180)'
              } else if (item.type === 2) {
                icon = <Edit2 size={size}/>
                iconColor = 'rgb(255,127,80)'
              } else if (item.type === 3) {
                icon = <Trash size={size}/>
                iconColor = 'rgb(178,34,34)'
              } else if (item.type === 4) {
                icon = <Check size={size}/>
                iconColor = 'rgb(60,179,113)'
              } else if (item.type === 5) {
                icon = <X size={size}/>
                iconColor = 'rgb(255,127,80)'
              } else if (item.type === 6) {
                icon = <UserPlus size={size}/>
                iconColor = 'rgb(70,130,180)'
              } else if (item.type === 7) {
                icon = <UserMinus size={size}/>
                iconColor = 'rgb(255,127,80)'
              } else if (item.type === 8) {
                icon = <UserCheck size={size}/>
                iconColor = 'rgb(60,179,113)'
              } else if (item.type === 9) {
                icon = <UserX size={size}/>
                iconColor = 'rgb(178,34,34)'
              } else if (item.type === 10) {
                icon = <AlertCircle size={size}/>
                iconColor = 'rgb(70,130,180)'
              } else if (item.type === 11) {
                icon = <AlertCircle size={size}/>
                iconColor = 'rgb(255,127,80)'
              }
              return (
                <TimelineEvent
                  title={<b>{item.date}</b>}
                  createdAt={<h6>{item.detail}</h6>}
                  icon={icon}
                  iconColor={iconColor}
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