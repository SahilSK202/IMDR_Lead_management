import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import MaterialTable from "material-table";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import { alpha } from "@material-ui/core/styles";

const backStyle = {
  width: "10vh",
  padding: "10px",
  margin: "10px",
  marginRight: "",
  backgroundColor: "#4ab5da",
};

export const UserListScreen = () => {
  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    appBar: {
      top: "auto",
      bottom: 0,
      textAlign: "center",
    },

    title: {
      flexGrow: 1,
      letterSpacing: "0.175em",
      fontSize: "140%",
  
    },
    tableStyle:{
      marginTop:400,
      width:"200px",
      height:"100px",
    }
  }));

  const classes = useStyles();

  let history = useHistory();

  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState("true");

  const updateHandler = async (email, isAdmin) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    };

    try {
      await axios.put(`/api/users/${email}`, { email, isAdmin }, config);
      setUpdateSuccess(true);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const deleteHandler = async (email) => {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    };

    try {
      await axios.delete(`/api/users/${email}`, config);
      setDeleteSuccess(true);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      history.push("/login");
    }

    const fetchData = async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      try {
        const { data } = await axios.get("/api/users", config);
        setUsers(data);

        setIsLoading(false);
      } catch (error) {
        // localStorage.removeItem("authToken");
        setError("You are not authorized please login");
        console.log(error);
      }
    };

    fetchData();
  }, [history, deleteSuccess, updateSuccess]);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      history.push("/login");
    }

    const fetchData = async () => {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      };

      try {
        const { data } = await axios.get("/api/auth/home", config);
        setUserInfo(data);
      } catch (error) {
        localStorage.removeItem("authToken");
        setError("You are not authorized please login");
      }
    };

    fetchData();
  }, [history]);

  const columns = [
    
    {
      title: "User Name",
      field: "name",
      defaultSort: "asc",
      editable: "never",
    },
    {
      title: "Email",
      field: "email",
      align: "",
      editable: "never",
    },
    {
      title: "Contact",
      field: "contact",
      align: "",
      editable: "never",
    },
    {
      title: "Admin",
      field: "admin",
      align: "",
      lookup: {
        1: "Yes",
        2: "No",
      },
      
    },
    
  ];

  return (
    <>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={backStyle}
            onClick={() => {
              history.push("/");
            }}
          >
            Back
          </Button>
          <Typography variant="h6" className={classes.title}>
            Users List
          </Typography>
        </Toolbar>
      </AppBar>
      
      <div>
        <MaterialTable  classes={classes.tableStyle}
          data={users.map((user) => ({
            name: user.username,
            email: user.email,
            contact: user.contact ? `+91 ${user.contact}` : "NA",
            admin: user.isAdmin ? "1" : "2",
          }))}
          columns={columns}
          isLoading={isLoading}
          localization={{
            body: {
              editRow: {
                deleteText: "Are you sure you want to delete this user ?",
              },
              deleteTooltip: "Delete User",
              editTooltip: "Edit User",
            },
          }}
          editable={{
            isDeletable: (rowData) => rowData.admin === "2",
            isEditable: (rowData) => rowData.email !== userInfo.email,
            onRowUpdate: (newRow, oldRow) =>
              new Promise((resolve, reject) => {
                setUpdateSuccess(false);
                updateHandler(
                  oldRow.email,
                  oldRow.admin === "2" ? true : false
                );

                setTimeout(() => resolve(), 4000);
              }),
            onRowDelete: (selectedRow) =>
              new Promise((resolve, reject) => {
                setDeleteSuccess(false);
                deleteHandler(selectedRow.email.toString());

                setTimeout(() => resolve(), 4000);
              }),
          }}
          options={{
            paging: false,
            sorting: true,
            search: false,
            showTitle: false,
            toolbar: false,
            actionsColumnIndex: -1,
            rowStyle: (data, index) =>
              index % 2 === 0 ? { background: "#f5f5f5" } : null,
            headerStyle: { background: "#9c66e2", fontStyle: "bold" },
          }}
        />
      </div>
    </>
  );
};

export default UserListScreen;
