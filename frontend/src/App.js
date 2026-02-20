import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

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

  const markAttendance = async (empId, status) => {
    try {
      await axios.post(`${API_BASE}/attendance`, { employee_id: empId, status });
      fetchData(); 
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <h1 style={{ textAlign: 'center' }}>HRMS Professional Dashboard</h1>

      {/* Analytics Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ width: '300px', textAlign: 'center', background: '#f9f9f9', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <h3>Today's Stats</h3>
          <Pie data={chartData} />
        </div>
      </div>

      <hr />

      {/* Registration Section */}
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h3>Add New Employee</h3>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" style={{ margin: '5px', padding: '8px' }} />
        <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" style={{ margin: '5px', padding: '8px' }} />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ margin: '5px', padding: '8px' }}>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
          <option value="Manager">Manager</option>
        </select>
        <button onClick={addEmployee} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px' }}>Add Employee</button>
      </div>

      {/* Search Bar */}
      <div style={{ margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="🔍 Search by name or role..." 
          style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employee Table */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>
                <button onClick={() => markAttendance(emp.id, 'Present')} style={{ backgroundColor: '#d4edda', color: '#155724', marginRight: '8px', cursor: 'pointer', border: '1px solid #c3e6cb', padding: '5px 10px' }}>Present</button>
                <button onClick={() => markAttendance(emp.id, 'Absent')} style={{ backgroundColor: '#f8d7da', color: '#721c24', cursor: 'pointer', border: '1px solid #f5c6cb', padding: '5px 10px' }}>Absent</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;