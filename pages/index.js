import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  Input,
  Button,
  Badge,
  Navbar,
  NavbarBrand,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  ButtonGroup,
} from "reactstrap";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileImport,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Select from "react-select";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";

export default function Home() {
  const [data, setData] = useState(false);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState([]);
  const [update, setUpdate] = useState(false);
  const [inputs, setInputs] = useState(false);
  const [tasks, setTasks] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [clear, setClear] = useState(false);
  const toggle = () => setModal(!modal);
  const toggleClear = () => setClear(!clear);
  const [expanded, setExpanded] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({})


  function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
    const ref = useRef();
    useEffect(() => {
      if (typeof indeterminate === "boolean") {
        ref.current.indeterminate = !rest.checked && indeterminate;
        console.log("IndeterminateCheckbox", rest);
      }
    }, [ref, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={ref}
        className={className + " cursor-pointer"}
        {...rest}
      />
    );
  }

  const findRecursiveTask = (id, tasks, oritask, counter, oricounter) => {
    const task = tasks.find((f) => f.id == id);
    if (task) {
      return task;
    } else {
      if (tasks[counter].subRows) {
        //find in subrow
        return findRecursiveTask(
          id,
          tasks[counter].subRows,
          oritask,
          0,
          counter
        );
      } else {
        //go next
        ++oricounter;
        return findRecursiveTask(id, oritask, oritask, oricounter, oricounter);
      }
    }
  };

  function actionFormatter(id) {
    return (
      <div>
        <Button
          className="m-1"
          size="sm"
          color="warning"
          onClick={() => {
            setUpdate(true);
            const tasks = localStorage.getItem("tasks")
              ? JSON.parse(localStorage.getItem("tasks"))
              : [];

            let task = null;
            task = findRecursiveTask(id, tasks, tasks, 0, 0);
            setInputs(task);
            toggle();
          }}
        >
          <FaEdit className="me-1" />
          Edit
        </Button>
        <Button
          className="m-1"
          size="sm"
          color="info"
          onClick={() => {
            setUpdate(false);
            setInputs({ ["parent"]: id });
            toggle();
          }}
        >
          <FaFileImport className="me-1" />
          Subtask
        </Button>
      </div>
    );
  }

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "click",
        header: ({ table }) => (
          <>
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />{" "}
            <button
              className="btn"
              {...{
                onClick: table.getToggleAllRowsExpandedHandler(),
              }}
            >
              {table.getIsAllRowsExpanded() ? (
                <FaChevronDown />
              ) : (
                <FaChevronUp />
              )}
            </button>
          </>
        ),
        cell: ({ row }) => {
          console.log("row.getValue()", row);
          return (
            <div
              style={{
                // Since rows are flattened by default,
                // we can use the row.depth property
                // and paddingLeft to visually indicate the depth
                // of the row
                paddingLeft: `${row.depth * 2}rem`,
              }}
            >
              <>
                <IndeterminateCheckbox
                  {...{
                    checked: row.getIsSelected(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler(),
                  }}
                />{" "}
                {row.getCanExpand() && (
                  <button
                    className="btn"
                    {...{
                      onClick: row.getToggleExpandedHandler(),
                      style: { cursor: "pointer" },
                    }}
                  >
                    {row.getIsExpanded() ? <FaChevronDown /> : <FaChevronUp />}
                  </button>
                )}
              </>
            </div>
          );
        },
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "id",
        header: () => "Task ID",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "desc",
        header: () => "Description",
        footer: (props) => props.column.desc,
      },
      {
        accessorKey: "status",
        header: () => "Status",
        cell: (info) => labelFormatter(info.getValue()),
        footer: (props) => props.column.status,
      },
      {
        accessorKey: "sub_done",
        header: () => "Subtask Done",
        footer: (props) => props.column.sub_done,
      },
      {
        accessorKey: "sub_comp",
        header: () => "Subtask Completed",
        footer: (props) => props.column.sub_comp,
      },
      {
        accessorKey: "action",
        header: () => "Action",
        cell: (info) => actionFormatter(info.getValue()),
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { expanded, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    debugTable: true,
  });

  const saveTaskToDatabase = (tasks) => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    setRefresh(true);
  };

  const handleChange = (event) => {
    setInputs({
      ...inputs,
      [event.target.name]: event.target.value,
    });
  };

  const clearTask = () => {
    localStorage.clear();
    toggleClear();
    setRefresh(true);
  };

  const recursiveFindParent = (tasks, parent, id, desc) => {
    const newTasks = tasks.map((x) => {
      console.log("parent - x", x.id);
      //check parent id first
      if (x.id == parent) {
        if (x.subRows) {
          x.subRows.push({
            id: id,
            parent: parent,
            status: "I",
            desc: desc,
          });
        } else {
          x.subRows = [
            {
              id: id,
              parent: parent,
              status: "I",
              desc: desc,
            },
          ];
        }
        return x;
      } else {
        if (x.subRows) {
          const newSubRow = recursiveFindParent(x.subRows, parent, id, desc);
          x.subRows = newSubRow;
          return x;
        } else {
          return x;
        }
      }
    });

    return newTasks;
  };

  const saveTask = () => {
    //allow nextjs to save in localstorage
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("running_id")
        ? parseInt(localStorage.getItem("running_id")) + 1
        : 1;
      let sub = 0;
      let sub_done = 0;
      let sub_comp = 0;
      let tasks = localStorage.getItem("tasks")
        ? JSON.parse(localStorage.getItem("tasks"))
        : [];
      let parent = inputs.parent ? inputs.parent : null;

      //add subRows
      if (parent) {
        //get the parent
        const newTasks = recursiveFindParent(tasks, parent, id, inputs.desc);
        saveTaskToDatabase(newTasks);
      } else {
        tasks.push({
          id: id,
          parent: parent,
          status: "I",
          sub: sub,
          sub_done: sub_done,
          sub_comp: sub_comp,
          desc: inputs.desc,
        });
        saveTaskToDatabase(tasks);
      }
      localStorage.setItem("running_id", id);
      toggle();
    }
  };

  const recursiveUpdateTask = (tasks, id) => {
    const newTasks = tasks.map((task) => {
      if (task.id == id) {
        task.desc = inputs.desc;
        return task;
      } else {
        if (task.subRows) {
          let temp = recursiveUpdateTask(task.subRows, id);
          task.subRows = temp;
          return task;
        } else {
          return task;
        }
      }
    });

    return newTasks;
  };

  const updateTask = () => {
    //allow nextjs to save in localstorage
    if (typeof window !== "undefined") {
      const editTask = recursiveUpdateTask(tasks, inputs.id);
      saveTaskToDatabase(editTask);
      toggle();
    }
  };

  const changeAllSubToParent = (editTask, parent, sub, done, comp) => {
    let task = tasks.find((x) => parent == x.id);
    task.sub = task.sub + sub;
    task.sub_done = task.sub_done + done;
    task.sub_comp = task.sub_comp + comp;
    if (
      (task.sub == 0 && task.status == "D") ||
      (task.sub_done == task.sub && task.status == "D")
    )
      task.status = "C"; //change status Done to Completed

    editTask = editTask.map((obj) => (task.id == obj.id ? task : obj));

    if (task.parent != 0) {
      return changeAllSubToParent(editTask, task.parent, sub, done, comp);
    } else {
      return editTask;
    }
  };

  const updateParentCount = (
    tasks,
    parent,
    type,
    value,
    comp_value,
    status,
    prev
  ) => {
    let input = tasks.find((x) => x.id == parent);

    switch (type) {
      case "sub":
        input.sub = parseInt(input.sub) + value;
        input.sub_comp = parseInt(input.sub_comp) + comp_value;
        break;
      case "sub_done":
        input.sub_done = parseInt(input.sub_done) + value;
        if (status == "C" || (status == "I" && prev == "C"))
          input.sub_comp = parseInt(input.sub_comp) + comp_value;
        break;
    }
    //get initial value
    let prev_status = input.status;
    if (input.status != "I") {
      input.status = input.sub_done == input.sub ? "C" : "D";
      //add or minus complete value
      if (input.status == "C" && prev_status == "D")
        comp_value = comp_value + 1;
      if (input.status == "D" && prev_status == "C")
        comp_value = comp_value - 1;
    }

    if (input.parent == 0) {
      return tasks.map((obj) => (inputs.id == parent ? input : obj));
    } else {
      updateParentCount(
        tasks,
        input.parent,
        type,
        value,
        comp_value,
        status,
        prev
      );
    }
  };

  function labelFormatter(cell) {
    let color = "badge bg-secondary";
    let text = "IN PROGRESS";

    switch (cell) {
      case "D":
        color = "badge bg-primary";
        text = "DONE";
        break;
      case "C":
        color = "badge bg-succes";
        text = "COMPLETE";
        break;
      default:
        color = "badge bg-secondary";
        text = "IN PROGRESS";
        break;
    }
    return <span className={color}>{text}</span>;
  }

  const handleFilter = (selected) => {
    const index = filter.indexOf(selected);
    if (index < 0) {
      filter.push(selected);
    } else {
      filter.splice(index, 1);
    }
    setFilter([...filter]);

    let tasks = localStorage.getItem("tasks")
      ? JSON.parse(localStorage.getItem("tasks"))
      : [];
    let data = tasks.filter((x) => x.parent == 0);

    if (filter.length === 0) {
      setTasks(tasks);
      setData(data);
    } else {
      let filterTasks = tasks.filter(
        (x) =>
          x.status == filter[0] ||
          x.status == filter[1] ||
          x.status == filter[2]
      );
      setTasks(filterTasks);
      let filterData = data.filter(
        (x) =>
          x.status == filter[0] ||
          x.status == filter[1] ||
          x.status == filter[2]
      );
      setData(filterData);
    }
  };

  useEffect(() => {
    //load task data
    let _tasks = localStorage.getItem("tasks")
      ? JSON.parse(localStorage.getItem("tasks"))
      : [];
    setTasks(_tasks);
    setData(_tasks);
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    if(rowSelection){
      console.log(rowSelection);
    }
  }, [rowSelection])

  return (
    <>
      <Head>
        <title>ToDoNext</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar color="dark" dark expand="md" full={true}>
        <NavbarBrand className="mx-4" href="/">
          ToDoNext
        </NavbarBrand>
      </Navbar>
      <Card className="text-muted">
        <CardBody>
          <Row className="">
            <Col sm="6" xs="12" className="p-1">
              <CardTitle tag="h5" className="text-bottom">
                To Do List
              </CardTitle>
            </Col>
            <Col sm="6" xs="12">
              <Button
                color="danger"
                className="float-end m-1"
                size="sm"
                onClick={() => {
                  toggleClear();
                }}
              >
                <FaTrash className="me-1" />
                Clear Task
              </Button>

              <Button
                color="primary"
                className="float-end m-1"
                size="sm"
                onClick={() => {
                  setInputs(false);
                  setUpdate(false);
                  toggle();
                }}
              >
                <FaPlus className="me-1" />
                Add Task
              </Button>

              <ButtonGroup className="float-end m-1">
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => handleFilter("I")}
                  active={filter.includes("I")}
                  outline
                >
                  <FaFile className="me-1" />
                  IN PROGRESS
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => handleFilter("D")}
                  active={filter.includes("D")}
                  outline
                >
                  <FaFileAlt className="me-1" />
                  DONE
                </Button>
                <Button
                  size="sm"
                  color="success"
                  onClick={() => handleFilter("C")}
                  active={filter.includes("C")}
                  outline
                >
                  <FaFileArchive className="me-1" />
                  COMPLETE
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <div className="table-responsive ">
            <table className="table table-bordered table-striped table-hover">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => {
                  return (
                    <tr key={row.original.id}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>
            {update ? "Update Task" : "Add Task"}
          </ModalHeader>
          <ModalBody>
            <Form>
              <Input
                bsSize="sm"
                className="m-1"
                type="text"
                name="desc"
                id="desc"
                placeholder="Task Description"
                onChange={handleChange}
                value={inputs.desc}
              />
              {/* {update ? (
                <Select
                  className="m-1"
                  name="parent"
                  id="parent"
                  options={parent.filter((x) => x.value !== inputs.id)}
                  value={parent.find((x) => x.value === inputs.parent)}
                  onChange={(selected) => handleChangeSelect(selected.value, "parent")}
                  placeholder="Select Parent Task"
                />
              ) : null} */}
            </Form>
          </ModalBody>
          <ModalFooter>
            {update ? (
              <Button color="primary" onClick={() => updateTask()}>
                <FaEdit className="me-1" />
                Update
              </Button>
            ) : (
              <Button color="primary" onClick={() => saveTask()}>
                Submit
              </Button>
            )}{" "}
            <Button color="secondary" onClick={toggle} outline>
              <FaTimes className="me-1" />
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={clear} toggle={toggleClear}>
          <ModalHeader toggle={toggleClear}>Clear Task</ModalHeader>
          <ModalBody>
            <p>This action will clear all the tasks. Are you sure?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={() => clearTask()}>
              Confirm
            </Button>
            <Button color="secondary" onClick={toggleClear} outline>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Card>
    </>
  );
}
