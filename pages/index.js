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

const products = [
    { id: 1, status: "I" , sub: 3, subdone: 2, subcomp: 1, desc: "Create user requirement"},
    { id: 2, status: "C" , sub: 4, subdone: 2, subcomp: 1, desc: "Design database" },
    { id: 3, status: "D" , sub: 3, subdone: 2, subcomp: 1, desc: "Unit testing" },
    { id: 11, status: "I" , sub: 3, subdone: 2, subcomp: 1, desc: "Create user requirement"},
];

export default function Home() {
  const [modal, setModal]       = useState(false);
  const [filter, setFilter]     = useState([]);
  const [update, setUpdate]     = useState(false);
  const [inputs, setInputs]     = useState(false);
  const [tasks, setTasks]       = useState(false);
  const [selected, setSelected] = useState(false);
  const [refresh, setRefresh]   = useState(false);

  const toggle           = () => setModal(!modal);

  const handleChange = event => {
    setInputs({
        ...inputs,
        [event.target.name]: event.target.value
    });
  };

  const saveTaskToDatabase = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    setRefresh(true);
  }

  const saveTask = () => {
    if (typeof window !== 'undefined') {
      // You now have access to `window`
      //let subtask  = inputs.parent ? tasks.filter( x => x.parent == inputs.parent) : false; 
      let id       = localStorage.getItem('running_id') ? parseInt(localStorage.getItem('running_id')) + 1 : 1;
      let sub      = 0;
      let sub_done = 0; 
      let sub_comp = 0;
      let tasks    = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
      let parent   = inputs.parent ? inputs.parent : 0;

      if(inputs.parent )
        updateParentCount(tasks, inputs.parent, 'sub', 1);

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
      let editTask = tasks.map(obj => inputs.id == obj.id ? inputs : obj);
      saveTaskToDatabase(editTask);
      toggle();
    }
  };

  const updateParentCount = (tasks, parent, type, value) => {
    let input =  tasks.find(x => x.id == parent);
    switch(type){
      case 'sub' :
        input.sub = parseInt(input.sub) + value;
        break;
      case 'sub_done' :
        input.sub_done = parseInt(input.sub_done) + value;
        break;
      case 'sub_comp' :
        input.sub_comp = parseInt(input.sub_comp) + value;
        break;
    }
    if(input.status != "I")
      input.status = input.sub_done == input.sub ? 'C' : 'D';

    if(input.parent == 0){
      return tasks.map(obj => inputs.id == parent ? input : obj);
    }else{
      updateParentCount(tasks, input.parent, type, value);
    }
  };

  function labelFormatter(cell, row) {
    let color = "secondary";
    let text  = "In Progress";

    switch(cell){
      case "D":
        color = "primary";
        text  = "Done";
        break;
      case "C":
        color = "success";
        text  = "Completed";
        break;
      default:
        break;
    }

    return (
        <span>
            <Badge color={color}>{text}</Badge>
        </span>
    );
  }

  function actionFormatter(cell, row) {
      return (
        <div>
          <ButtonGroup>
            <Button size="sm" color="warning" onClick={() => {
              setUpdate(true);
              setInputs({
                ...inputs,
                ['id']      :row.id,
                ['desc']    :row.desc,
                ['status']  :row.status,
                ['parent']  :row.parent,
                ['sub']     :row.sub,
                ['sub_done']:row.sub_done,
                ['sub_comp']:row.sub_comp,
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
    return  (
        <p>{cell} / {row.sub}</p>
    );
  }

  const handleOnSelect = (row, isSelect) => {

    let value = 0;
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
      updateParentCount(tasks, row.parent, 'sub_done', value);
    
    tasks.map(obj => row == obj.id || obj);
    console.log('handleOnSelect', tasks);
    saveTaskToDatabase(tasks);
  }

  const handleOnSelectAll = (isSelect, rows) => {
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
    let filterTasks = tasks.filter(x => x.status == filter[0] ||  x.status == filter[1] || x.status == filter[2])
    setTasks(filterTasks);
  }

  const selectRow = {
    mode         : 'checkbox',
    clickToSelect: false,
    clickToExpand: true,
    onSelect     : handleOnSelect,
    onSelectAll  : handleOnSelectAll,
    selected     : selected
  };

  const expandRow = {
    onlyOneExpanding: true,
    showExpandColumn: true,
    renderer: row => (
      <div>
        <p>{ `This Expand row is belong to rowKey ${row.id}` }</p>
        <p>You can render anything here, also you can add additional data on every row object</p>
        <p>expandRow.renderer callback will pass the origin row object to you</p>
      </div>
    ),
    showExpandColumn: true,
    expandHeaderColumnRenderer: ({ isAnyExpands }) => {
      if (isAnyExpands) {
        return <b>-</b>;
      }
      return <b>+</b>;
    },
    expandColumnRenderer: ({ expanded }) => {
      if (expanded) {
        return (
          <b>-</b>
        );
      }
      return (
        <b>+</b>
      );
    }
  };

  const columns = [
    {
      dataField: 'id',
      text: 'Task ID'
    }, {
      dataField: 'parent',
      text: 'Parent ID'
    },{
      dataField: 'desc',
      text: 'Description'
    },{
      dataField: 'status',
      text: 'Status',
      formatter: labelFormatter,
      headerAlign: 'center',
      align: 'center',
    },{
      dataField: 'sub_done',
      text: 'Subtask Done',
      formatter: subFormattter,
    },{
      dataField: 'sub_comp',
      text: 'Subtask Completed',
      formatter: subFormattter,
    },{
      dataField: '#',
      text: 'Action',
      formatter: actionFormatter,
      headerAlign: 'right',
      align: 'right'
    }
  ];

  const rowStyle = { 
    height: '20px'
  };

  const colStyle = {
    overflowX: 'auto'
  }

  useEffect(() => {
      let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
      setTasks(tasks);
      setRefresh(false);

      let selected = tasks.filter(x => x.status != "I").map(a => a.id); 
      setSelected(selected);
  }, [refresh])

  return (
    <div>
      <Head>
        <title>ToDoNext</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar color="dark" dark expand="md">
        <NavbarBrand href="/">ToDoNext</NavbarBrand>
      </Navbar>

      {/*<div className={styles.container}>*/}
        {/*<main className={styles.main}>*/}
          <Card className="text-muted">
            <CardBody>
              <Row>
                <Col sm="8"><CardTitle tag="h5" className="text-bottom">To Do List</CardTitle></Col>
                
                <Col sm="3">
                  <ButtonGroup>
                    <Button size="sm" color="secondary" onClick={() => handleFilter('I')} active={filter.includes('I')} outline>In Progress</Button>
                    <Button size="sm" color="primary" onClick={() => handleFilter('D')} active={filter.includes('D')} outline>Done</Button>
                    <Button size="sm" color="success" onClick={() => handleFilter('C')} active={filter.includes('C')} outline>Completed</Button>
                  </ButtonGroup>
                </Col>

                <Col sm="1" ><Button color="info" className="float-right" size="sm" onClick={() => { setInputs(false); setUpdate(false); toggle()}}>Add Task</Button>{' '}</Col>
              </Row>
              <BootstrapTable
                keyField      = "id"
                data          = {tasks}
                columns       = {columns}
                bootstrap4
                bordered      = {true}
                //rowStyle      = {rowStyle}
                //colStyle      = {colStyle}
                //headerClasses = "header-class"
                selectRow     = {selectRow}
                expandRow     = {expandRow}
                pagination    = {paginationFactory({
                  sizePerPage: 20,
                  sizePerPageList: [10, 20, 50, 100]
                })}
              />
            </CardBody>
            <Modal isOpen={modal} toggle={toggle}>
              <ModalHeader toggle={toggle}>{update ? 'Update Task': 'Add Task' }</ModalHeader>
              <ModalBody>
                  <Input type="text" name="desc" id="desc" placeholder="Task Description" bsSize="lg" onChange={handleChange} value={inputs.desc}/>
              </ModalBody>
              <ModalFooter>
                {update ? <Button color="primary" onClick = {()=>updateTask()}>Update</Button> : <Button color="primary" onClick = {()=>saveTask()}>Submit</Button> }{' '}
                <Button color="secondary"  onClick={toggle} outline>Cancel</Button>
              </ModalFooter>
            </Modal>
          </Card>
        {/*</main>
      </div>*/}
    </div>
  )
}
