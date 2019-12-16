import React from 'react'
import Gantt from './Gantt'
import Toolbar from './Toolbar'
import { gantt } from 'dhtmlx-gantt'

//class
export default class ContentGanttChart extends React.Component {

  //constructor
  constructor(props){
    super(props)
    this.state = {
      data:{data:[]},
      currentZoom:'Days',
    }
  }

  //component did mount
  componentDidMount(){
    if (localStorage.getItem('leader') === '0') {
      gantt.config.readonly = true
    }
  }

  //component will receive props
  UNSAFE_componentWillReceiveProps(props){
    gantt.parse({data:props.data,links:props.links})
    gantt.eachTask(function(task){ task.$open = true })
    gantt.render()
  }

  //handle zoom change
  handleZoomChange = (zoom) => {
    this.setState({
      currentZoom: zoom
    });
  }

  //log data update
  logDataUpdate = (type, action, item, id) => {
    if (action === 'create') { this.props.add(item) }
    else if (action === 'update') { this.props.edit(item) }
    else if (action === 'delete') { this.props.delete(item) }
  }

  //render
  render(){
    const { currentZoom } = this.state
    return (
      <div>
        <div className="zoom-bar" style={{paddingBottom:45}}>
          <Toolbar
            zoom={currentZoom}
            onZoomChange={this.handleZoomChange}
          />
        </div>
        <div className="gantt-container">
          <Gantt
            tasks={this.state.data}
            zoom={currentZoom}
            onDataUpdated={this.logDataUpdate}
          />
        </div>
      </div>
    )
  }

}