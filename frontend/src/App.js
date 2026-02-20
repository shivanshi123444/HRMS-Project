import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css'; // Ensure you have some basic styling here

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Set your Backend URL here
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Developer");

  // Load data from Backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const empRes = await axios.get(`${API_BASE}/employees`);
      const attRes = await axios.get(`${API_BASE}/attendance`);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Add New Employee
  const addEmployee = async () => {
    if (!newName || !newEmail) return alert("Please fill details");
    try {
      await axios.post(`${API_BASE}/employees`, { name: newName, email: newEmail, role: newRole });
      setNewName("");
      setNewEmail("");
      fetchData();
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  // Mark Attendance
  const markAttendance = async (empId, status) => {
    try {
      await axios.post(`${API_BASE}/attendance`, { employee_id: empId, status });
      fetchData(); // Refresh chart and table
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  // Filter Logic for Search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart Data Calculation
  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [
          attendance.filter(a => a.status === 'Present').length,
          attendance.filter(a => a.status === 'Absent').length
        ],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>HRMS Professional Dashboard</h1>

      {/* Analytics Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ width: '300px', textAlign: 'center', background: '#f9f9f9', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3>Today's Stats</h3>
          <Pie data={chartData} />
        </div>
      </div>

      <hr />

      {/* Registration Section */}
      <div style={{ margin: '20px 0' }}>
        <h3>Add New Employee</h3>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" />
        <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
          <option value="Manager">Manager</option>
        </select>
        <button onClick={addEmployee} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 15px', marginLeft: '10px', cursor: 'pointer' }}>Add</button>
      </div>

      {/* Search Bar */}
      <div style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by name or role..." 
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employee Table */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th></th>