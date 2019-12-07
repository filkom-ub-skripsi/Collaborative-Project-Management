import React from 'react'
import { Box, Trash, Plus, Edit2, Check, X, UserPlus, UserX } from 'react-feather'
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
          detail:'You created this project',
          type:0
        })
      } else if (temp[i]['code'] === 'P1') {
        data.push({
          date:temp[i]['date'],
          detail:'You updated the project overview',
          type:0
        })
      } else if (temp[i]['code'] === 'P2') {
        data.push({
          date:temp[i]['date'],
          detail:'You edited the project agreement',
          type:0
        })
      } else if (temp[i]['code'] === 'P3') {
        data.push({
          date:temp[i]['date'],
          detail:'You started the project',
          type:0
        })
      } else if (temp[i]['code'] === 'M0') {
        data.push({
          date:temp[i]['date'],
          detail:'You add '+temp[i]['detail']+' as a module',
          type:1
        })
      } else if (temp[i]['code'] === 'M1') {
        data.push({
          date:temp[i]['date'],
          detail:'You edited '+temp[i]['detail']+' module',
          type:2
        })
      } else if (temp[i]['code'] === 'M2') {
        data.push({
          date:temp[i]['date'],
          detail:'You deleted '+temp[i]['detail']+' module',
          type:3
        })
      } else if (temp[i]['code'] === 'R0') {
        data.push({
          date:temp[i]['date'],
          detail:'You add '+temp[i]['detail'].split('_')[0]+' as a requirement of '+temp[i]['detail'].split('_')[1]+' module',
          type:1
        })
      } else if (temp[i]['code'] === 'R1') {
        data.push({
          date:temp[i]['date'],
          detail:'You edited '+temp[i]['detail'].split('_')[0]+' requirement from '+temp[i]['detail'].split('_')[1]+' module',
          type:2
        })
      } else if (temp[i]['code'] === 'R2') {
        data.push({
          date:temp[i]['date'],
          detail:'You deleted '+temp[i]['detail'].split('_')[0]+' requirement from '+temp[i]['detail'].split('_')[1]+' module',
          type:3
        })
      } else if (temp[i]['code'] === 'R3') {
        data.push({
          date:temp[i]['date'],
          detail:'You finished the '+temp[i]['detail'].split('_')[0]+' requirement from '+temp[i]['detail'].split('_')[1]+' module',
          type:4
        })
      } else if (temp[i]['code'] === 'R4') {
        data.push({
          date:temp[i]['date'],
          detail:'You undo finished the '+temp[i]['detail'].split('_')[0]+' requirement from '+temp[i]['detail'].split('_')[1]+' module',
          type:5
        })
      } else if (temp[i]['code'] === 'I0') {
        data.push({
          date:temp[i]['date'],
          detail:'You invited '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division to become a collaborator',
          type:6
        })
      } else if (temp[i]['code'] === 'I1') {
        data.push({
          date:temp[i]['date'],
          detail:'You cancelled invitation on '+temp[i]['detail'].split('_')[0]+' from '+temp[i]['detail'].split('_')[1]+' division to become a collaborator',
          type:7
        })
      }
    }
    return (
      <div className="activities">
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
                icon = <UserX size={size}/>
                iconColor = 'rgb(178,34,34)'
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