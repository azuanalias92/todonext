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
  Label
} from "reactstrap";

const products = [
    { id: 1, status: "I" , sub: 3, subdone: 2, subcomp: 1, desc: "Create user requirement"},
    { id: 2, status: "C" , sub: 4, subdone: 2, subcomp: 1, desc: "Design database" },
    { id: 3, status: "D" , sub: 3, subdone: 2, subcomp: 1, desc: "Unit testing" },
    { id: 11, status: "I" , sub: 3, subdone: 2, subcomp: 1, desc: "Create user requirement"},
];

export default function Home() {
  const [modal, setModal]   = useState(false);
  const [update, setUpdate] = useState(false);
  const [inputs, setInputs] = useState(false);
  const [tasks, setTasks]   = useState(false);

  const toggle = () => setModal(!modal);

  const handleChange = event => {
    setInputs({
        ...inputs,
        [event.target.name]: event.target.value
    });
  };

  const saveTask = () => {
    console.log('saveTask', inputs);

    if (typeof window !== 'undefined') {
      // You now have access to `window`
      let id       = localStorage.getItem('running_id') ? parseInt(localStorage.getItem('running_id')) + 1 : 1;
      let sub      = 1;
      let sub_done = 1;
      let sub_comp = 1;
      let tasks    = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];

      console.log('saveTask', tasks);

      tasks.push({
        'id'      : id, 
        'status'  : 'I', 
        'sub'     : sub, 
        'sub_done': sub_done, 
        'sub_comp': sub_comp, 
        'desc'    : inputs.desc
      });

      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('running_id', id);
      setTasks(tasks);
      toggle();

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

  function addFormatter(cell, row) {
      return (
        <div>
          <FormGroup check inline>
            <Button color="warning" size="xs" onClick={toggle}>Edit</Button>
            <Button color="info" size="xs" onClick={toggle}>Subtask</Button>
            <Label check>
               <Input type="checkbox" /> 
            </Label>
          </FormGroup>
        </div>
      );
  }

  function subFormattter(cell, row){
    return  (
        <p>{cell} / {row.sub}</p>
    );
  }

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    clickToExpand: true,
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
      dataField: 'desc',
      text: 'Description'
    },{
      dataField: 'status',
      text: 'Status',
      formatter: labelFormatter,
      headerAlign: 'center',
      align: 'center',
    },{
      dataField: 'subdone',
      text: 'Subtask Done',
      formatter: subFormattter,
    },{
      dataField: 'subcomp',
      text: 'Subtask Completed',
      formatter: subFormattter,
    },{
      dataField: '#',
      text: 'Action',
      formatter: addFormatter,
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
      console.log('tasks', tasks);
  }, [])

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

      <div className={styles.container}>
        <main className={styles.main}>
          <Card className="text-muted">
            <CardBody>
              <Row>
                <Col sm="8"><CardTitle tag="h5" className="text-bottom">To Do List</CardTitle></Col>
                
                <Col sm="3">
                  <ButtonToggle color="secondary" size="sm">In Progress</ButtonToggle>{' '}
                  <ButtonToggle color="primary" size="sm">Done</ButtonToggle>{' '}
                  <ButtonToggle color="success" size="sm">Completed</ButtonToggle>{' '}
                </Col>

                <Col sm="1"><Button color="info" size="sm" onClick={toggle}>Add Task</Button>{' '}</Col>
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
                {update ? <Button color="primary" onClick = {()=>saveTask()}>Update</Button> : <Button color="primary" onClick = {()=>saveTask()}>Submit</Button> }{' '}
                <Button color="secondary"  onClick={toggle} outline>Cancel</Button>
              </ModalFooter>
            </Modal>
          </Card>
        </main>
      </div>
    </div>
  )
}
