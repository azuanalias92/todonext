import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from "react-bootstrap-table2-paginator"
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardSubtitle,
  Col,
  Container,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  Media,
  Badge,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText,
  ButtonToggle,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  ButtonGroup
} from "reactstrap";
import Select from 'react-select';

export default function Home() {
  const [modal, setModal]       = useState(false);
  const [filter, setFilter]     = useState([]);
  const [update, setUpdate]     = useState(false);
  const [inputs, setInputs]     = useState(false);
  const [tasks, setTasks]       = useState(false);
  const [selected, setSelected] = useState(false);
  const [refresh, setRefresh]   = useState(false);
  const [data, setData]         = useState(false);
  const [parent, setParent]     = useState(false);
  const [reassign, setReassign] = useState(false);

  const toggle = () => setModal(!modal);

  console.log('inputs', inputs);

  const saveTaskToDatabase = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    setRefresh(true);
  }

  const handleChange = event => {
    setInputs({
        ...inputs,
        [event.target.name]: event.target.value
    });
  };

  const handleChangeSelect = (value, name) => {
      setInputs({
          ...inputs,
          [name]: value
      });
      setReassign(true);
  };

  const saveTask = () => {
    //allow nextjs to save in localstorage
    if (typeof window !== 'undefined') {
      let id       = localStorage.getItem('running_id') ? parseInt(localStorage.getItem('running_id')) + 1 : 1;
      let sub      = 0;
      let sub_done = 0; 
      let sub_comp = 0;
      let tasks    = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
      let parent   = inputs.parent ? inputs.parent : 0;

      if(inputs.parent )
        updateParentCount(tasks, inputs.parent, 'sub', 1, 0, "I", "I");

      tasks.push({
        'id'      : id,
        'parent'  : parent, 
        'status'  : 'I', 
        'sub'     : sub, 
        'sub_done': sub_done, 
        'sub_comp': sub_comp, 
        'desc'    : inputs.desc
      });

      localStorage.setItem('running_id', id);
      saveTaskToDatabase(tasks);
      toggle();
    }
  };

  const updateTask = () => {
    //allow nextjs to save in localstorage
    if (typeof window !== 'undefined') {
      //edit current row
      let editTask = tasks.map(obj => inputs.id == obj.id ? inputs : obj);

      if(reassign){

        //find current and change parent
        let current        = tasks.find(x => x.id == inputs.id);
        //let current_parent = findParent(current.parent);
        //let change_parent  = findParent(inputs.parent);

        //calculate count
        //let count = calculateCount(inputs);

        let sub  = parseInt(current.sub) + 1;
        let done = current.status != "I" ? parseInt(current.sub_done) + 1 : current.sub_done;
        let comp = current.status == "C" ? parseInt(current.sub_comp) + 1 : current.sub_comp;

        editTask = changeAllSubToParent(editTask, current.parent, -sub, -done, -comp);
        console.log('minusAllSubToParent -last', editTask);
        editTask = changeAllSubToParent(editTask, inputs.parent, sub, done, comp);
        console.log('addAllSubToParent -last', editTask);
        setReassign(false);
      }
      console.log('editTask', editTask);
      saveTaskToDatabase(editTask);
      toggle();
    }
  };


  /*const changeAllSubToParent = (editTask, parent, sub, done, comp) => {
    let task = tasks.find( x => parent == x.id);
    console.log('minusAllSubToParent', task);
    console.log('minusAllSubToParent', sub);
    task.sub = task.sub - sub;
    task.sub_done = task.sub_done - done;
    task.sub_comp = task.sub_comp - comp;
    console.log('minusAllSubToParent', task);
    

    editTask = editTask.map(obj => task.id == obj.id ? task : obj);

    if(task.parent != 0){
      return changeAllSubToParent(editTask, task.parent, sub, done, comp);
    }else{
      return editTask;
    }
  }*/

  const changeAllSubToParent = (editTask, parent, sub, done, comp) => {
    let task = tasks.find( x => parent == x.id);
    task.sub = task.sub + sub;
    task.sub_done = task.sub_done + done;
    task.sub_comp = task.sub_comp + comp;
    console.log('addAllSubToParent', task);

    editTask = editTask.map(obj => task.id == obj.id ? task : obj);

    if(task.parent != 0){
      return changeAllSubToParent(editTask, task.parent, sub, done, comp);
    }else{
      return editTask;
    }
  }

  const calculateCount = (inputs) => {
    let count = countSubTask(inputs.id, inputs.status);

    //current row
    count.sub  = parseInt(count.sub) + 1;
    count.done = inputs.status != "I" ? parseInt(count.done) + 1 : count.done;
    count.comp = inputs.status == "C" ? parseInt(count.comp) + 1 : count.comp;

    //update parent
    let parent = tasks.find(obj => inputs.parent == obj.id);
    parent.sub      =  parseInt(parent.sub) + count.sub;
    parent.sub_done =  parseInt(parent.sub_done) + count.done;
    parent.sub_comp =  parseInt(parent.sub_comp) + count.comp;

    return count;
  }

  const countSubTask = (id, status) => {
    let subtask = tasks.find(x => x.parent == id);
    if(subtask){
      console.log('countSubTask', subtask);
      let count = countSubTask(subtask.id, subtask.status);
      let done = subtask.status != "I" ? 1 : 0;
      let comp = subtask.status == "C" ? 1 : 0; 

      count.sub  = parseInt(count.sub) + 1;
      count.done = parseInt(count.done) + done;
      count.comp = parseInt(count.comp) + comp;

      console.log('countSubTask', count);
      return count;
    }else{
      return {'sub':0, 'done':0, 'comp':0};
    }
  }

  const findParent = (id_parent) => {
    let parent = tasks.find(x => x.id == id_parent);
    if(parent.parent != 0){
      return findParent(parent.parent);
    }else{
      return parent.id;
    }
  }

  const updateParentCount = (tasks, parent, type, value, comp_value, status, prev) => {
    let input =  tasks.find(x => x.id == parent);

    switch(type){
      case 'sub' :
        input.sub      = parseInt(input.sub) + value;
        input.sub_comp = parseInt(input.sub_comp) + comp_value;
        break;
      case 'sub_done' :
        input.sub_done = parseInt(input.sub_done) + value;
        if(status == 'C' || (status == 'I' && prev == 'C'))
          input.sub_comp = parseInt(input.sub_comp) + comp_value;
        break;
    }
    //get initial value
    let prev_status = input.status;
    if(input.status != "I")
      input.status = input.sub_done == input.sub ? 'C' : 'D';
      if(input.status == 'C' && prev_status == 'D')
        comp_value = comp_value + 1;
      if(input.status == 'D' && prev_status == 'C')
        comp_value = comp_value - 1;

    if(input.parent == 0){
      return tasks.map(obj => inputs.id == parent ? input : obj);
    }else{
      updateParentCount(tasks, input.parent, type, value, comp_value, status, prev);
    }
  };

  function labelFormatter(cell, row) {
    let color = "secondary";
    let text  = "IN PROGRESS";

    switch(cell){
      case "D":
        color = "primary";
        text  = "DONE";
        break;
      case "C":
        color = "success";
        text  = "COMPLETE";
        break;
      default:
        break;
    }

    return (<span><Badge color={color}>{text}</Badge></span>);
  }

  function actionFormatter(cell, row) {
      return (
        <div>
          <ButtonGroup>
            <Button size="sm" color="warning" onClick={() => {
              setUpdate(true);
              //load latest data since action formatter is not updated 
              let lastest_data  = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
              let selected_task = lastest_data.find(x => x.id == row.id);
              setInputs({
                ...inputs,
                ['id']      :selected_task.id,
                ['desc']    :selected_task.desc,
                ['status']  :selected_task.status,
                ['parent']  :selected_task.parent,
                ['sub']     :selected_task.sub,
                ['sub_done']:selected_task.sub_done,
                ['sub_comp']:selected_task.sub_comp,
              });
              toggle();
            }}>Edit</Button>
            <Button size="sm" color="info" onClick={() => {
              setUpdate(false);
              setInputs({['parent'] :row.id});
              toggle();
            }}>Subtask</Button>
          </ButtonGroup>
          
        </div>
      );
  }

  function subFormattter(cell, row){
    let subtask = row.sub != 0 ? ((cell + '/' + row.sub) + ' - ' + (cell/row.sub * 100).toFixed(0) +  '%') : 'N/A';
    return (<p>{subtask}</p>);
  }

  const handleOnSelect = (row, isSelect) => {
    let value       = 0;
    let prev_status = row.status;

    if(isSelect){
      if(row.sub == 0 || row.sub == row.sub_done){
        row.status = "C";
      }else{
        row.status = "D";
      }
      value      = 1;
    }else{
      row.status = "I";
      value      = -1;
    }

    if(row.parent != 0)
      updateParentCount(tasks, row.parent, 'sub_done', value, value, row.status, prev_status);
    
    tasks.map(obj => row == obj.id || obj);
    saveTaskToDatabase(tasks);
  }

  const handleFilter = (selected) => {
    const index = filter.indexOf(selected);
    if (index < 0) {
      filter.push(selected);
    } else {
      filter.splice(index, 1);
    }
    setFilter([...filter]);
    
    let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
    let data  = tasks.filter(x => x.parent == 0);
  
    if(filter.length === 0){
      setTasks(tasks);
      setData(data);
    }else{
      let filterTasks = tasks.filter(x => x.status == filter[0] ||  x.status == filter[1] || x.status == filter[2]);
      setTasks(filterTasks);
      let filterData = data.filter(x => x.status == filter[0] ||  x.status == filter[1] || x.status == filter[2]);
      setData(filterData);
    }
  }

  const selectRow = {
    mode         : 'checkbox',
    clickToSelect: false,
    clickToExpand: true,
    onSelect     : handleOnSelect,
    hideSelectAll: true,
    selected     : selected
  };

  const expandRow = {
    onlyOneExpanding: true,
    showExpandColumn: true,
    renderer: row => {
      let child = tasks.filter(x => x.parent == row.id)
      return (
        <BootstrapTable
          bootstrap4
          keyField         = "id"
          data             = {child}
          columns          = {columns}
          bordered         = {true}
          noDataIndication = {'No results found'}
          selectRow        = {selectRow}
          expandRow        = {expandRow}
          pagination       = {paginationFactory({
            sizePerPage: 20,
            sizePerPageList: [10, 20, 50, 100]
          })}
        />
      )
    }
    ,
    showExpandColumn: true,
    expandHeaderColumnRenderer: ({ isAnyExpands }) => {
      if (isAnyExpands) {
        return <b>-</b>;
      }
      return <b>+</b>;
    },
    expandColumnRenderer: ({ expanded }) => {
      if (expanded) {
        return (<b>-</b>);
      }
      return <b>+</b>;
    }
  };

  const columns = [
    {
      dataField: 'id',
      text     : 'Task ID',
      //hidden   : true,
    }, {
      dataField: 'parent',
      text     : 'Parent ID',
      //hidden   : true,
    },{
      dataField: 'desc',
      text     : 'Description'
    },{
      dataField  : 'status',
      text       : 'Status',
      formatter  : labelFormatter,
      headerAlign: 'center',
      align      : 'center',
    },{
      dataField  : 'sub_done',
      text       : 'Subtask Done',
      formatter  : subFormattter,
      headerAlign: 'center',
      align      : 'center',
    },{
      dataField  : 'sub_comp',
      text       : 'Subtask Complete',
      formatter  : subFormattter,
      headerAlign: 'center',
      align      : 'center',
    },{
      dataField  : '#',
      text       : 'Action',
      formatter  : actionFormatter,
      headerAlign: 'right',
      align      : 'right'
    }
  ];

  useEffect(() => {
      //load task data
      let _tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
      setTasks(_tasks);
      
      //tick selected task
      let _selected = _tasks.filter(x => x.status != "I").map(a => a.id); 
      setSelected(_selected);

      //parent data
      let _data = _tasks.filter(x => x.parent == 0);
      if(_data[0])
        _data[0].refresh = Math.random(); //to keep data refresh
      setData(_data);

      let _parent = _tasks.map( a => { return {'label' : a.desc, 'value':a.id }} );
      setParent(_parent);

      setRefresh(false);
  }, [refresh])

  return (data && parent && tasks &&(
    <div>
      <Head>
        <title>ToDoNext</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">ToDoNext</NavbarBrand>
      </Navbar>
      <Card className="text-muted">
        <CardBody>
          <Row>
            <Col sm="8"><CardTitle tag="h5" className="text-bottom">To Do List</CardTitle></Col>
            
            <Col sm="3">
              <ButtonGroup>
                <Button size="sm" color="secondary" onClick={() => handleFilter('I')} active={filter.includes('I')} outline>IN PROGRESS</Button>
                <Button size="sm" color="primary" onClick={() => handleFilter('D')} active={filter.includes('D')} outline>DONE</Button>
                <Button size="sm" color="success" onClick={() => handleFilter('C')} active={filter.includes('C')} outline>COMPLETE</Button>
              </ButtonGroup>
            </Col>

            <Col sm="1" ><Button color="info" className="float-right" size="sm" onClick={() => { setInputs(false); setUpdate(false); toggle()}}>Add Task</Button>{' '}</Col>
          </Row>
          <BootstrapTable
            bootstrap4
            keyField         = "id"
            data             = {data}
            columns          = {columns}
            bordered         = {true}
            noDataIndication = {'No results found'}
            selectRow        = {selectRow}
            expandRow        = {expandRow}
            pagination       = {paginationFactory({
              sizePerPage: 20,
              sizePerPageList: [5, 10, 20, 50, 100]
            })}
          />
        </CardBody>
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>{update ? 'Update Task': 'Add Task' }</ModalHeader>
          <ModalBody>
          <Form>
            <FormGroup>
              <Label for="desc">Task Description</Label>
              <Input type="text" name="desc" id="desc" placeholder="Task Description" bsSize="lg" onChange={handleChange} value={inputs.desc}/>
            </FormGroup>
            {update ? 
              <FormGroup>
                <Label for="parent">Parent Task</Label>
                <Select name="parent" id="parent" options={parent.filter(x => x.value !== inputs.id)} value={parent.find(x => x.value === inputs.parent)} onChange={selected => handleChangeSelect(selected.value, "parent")} /> 
              </FormGroup>
            : null}
          </Form>
          </ModalBody>
          <ModalFooter>
            {update ? <Button color="primary" onClick = {()=>updateTask()}>Update</Button> : <Button color="primary" onClick = {()=>saveTask()}>Submit</Button> }{' '}
            <Button color="secondary"  onClick={toggle} outline>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Card>
    </div>
  ))
}
