import React from 'react'
import { Box, Trash, Plus, Edit2 } from 'react-feather'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'

//timeline
const timeline_class = "vertical-timeline-element--work"
const timeline_title = "vertical-timeline-element-title"
const timeline_paser = {paddingBottom:10}

//class
export default class ContentActivity extends React.Component {

  //render
  render() {
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
      }
    }
    return (
      <div className="activities">
        <VerticalTimeline layout="1-column">
          {
            data.map((item,index) => {
              var icon = null
              var pallete = null
              var timeline_style = null
              var timeline_icons = null
              var timeline_arrow = null
              if (item.type === 0) {
                icon = <Box/>
                pallete = '60,179,113'
                timeline_style = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_icons = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_arrow = {borderRight:'7px solid rgb('+pallete+')'}
              }
              else if (item.type === 1) {
                icon = <Plus/>
                pallete = '70,130,180'
                timeline_style = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_icons = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_arrow = {borderRight:'7px solid rgb('+pallete+')'}
              }
              else if (item.type === 2) {
                icon = <Edit2/>
                pallete = '255,127,80'
                timeline_style = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_icons = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_arrow = {borderRight:'7px solid rgb('+pallete+')'}
              }
              else if (item.type === 3) {
                icon = <Trash/>
                pallete = '178,34,34'
                timeline_style = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_icons = {background:'rgb('+pallete+')',color:'#fff'}
                timeline_arrow = {borderRight:'7px solid rgb('+pallete+')'}
              }
              return (
                <VerticalTimelineElement
                  className={timeline_class}
                  contentStyle={timeline_style}
                  contentArrowStyle={timeline_arrow}
                  icon={icon}
                  iconStyle={timeline_icons}
                  date={item.date}
                  key={index}
                >
                  <div style={timeline_paser}/>
                  <h5 className={timeline_title}>{item.detail}</h5>
                </VerticalTimelineElement>
              )
            })
          }
        </VerticalTimeline>
      </div>
    )
  }
}