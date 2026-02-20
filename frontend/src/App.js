import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Developer' });

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees", err);
    }
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/employees`, formData);
      setFormData({ name: '', email: '', role: 'Developer' }); // Reset form
      fetchEmployees(); // Refresh list
    } catch (err) {
      alert("Error adding employee: " + (err.response?.data?.error || err.message));
    }
  };

  const markAttendance = async (empId, status) => {
    try {
      await axios.post(`${API_BASE}/attendance`, {
        employee_id: empId,
        status: status
      });
      alert(`Success: Marked as ${status}`);
    } catch (err) {
      alert("Error marking attendance. Ensure backend is running.");
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>HRMS Dashboard</h1>
      
      {/* Registration Form */}
      <form onSubmit={addEmployee} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
        <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{padding: '8px'}} />
        <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{padding: '8px'}} />
        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{padding: '8px'}}>
          <option>Developer</option>
          <option>Designer</option>
          <option>Manager</option>
        </select>
        <button type="submit" style={{padding: '8px 15px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}>Add</button>
      </form>

      {/* Employee Table */}
      <table border="1" cellPadding="12" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#eeeeee' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
              <td>
                <button onClick={() => markAttendance(emp.id, 'Present')} style={{marginRight: '5px', color: 'green'}}>Present</button>
                <button onClick={() => markAttendance(emp.id, 'Absent')} style={{color: 'red'}}>Absent</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;