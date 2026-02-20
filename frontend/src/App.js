import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import toast, { Toaster } from 'react-hot-toast';
import { UserPlus, Search, Download, CheckCircle, XCircle } from 'lucide-react';
import Papa from 'papaparse';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function App() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Developer' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`),
        axios.get(`${API_BASE}/attendance`)
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
    } catch (err) {
      toast.error("Cloud Connection Failed");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return toast.error("Please fill all fields");
    try {
      await axios.post(`${API_BASE}/employees`, formData);
      toast.success(`${formData.name} added to payroll`);
      setFormData({ name: '', email: '', role: 'Developer' });
      fetchData();
    } catch (err) { toast.error("Submission Failed"); }
  };

  const handleAttendance = async (empId, status) => {
    try {
      await axios.post(`${API_BASE}/attendance`, { employee_id: empId, status });
      toast.success(`Marked as ${status}`, { icon: status === 'Present' ? '✅' : '❌' });
      fetchData();
    } catch (err) { toast.error("Log failed"); }
  };

  // Advanced Filtering Logic
  const filteredList = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || emp.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [employees, searchTerm, roleFilter]);

  // Export Data to Excel/CSV
  const exportData = () => {
    const csv = Papa.unparse(attendance);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "HRMS_Attendance_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report Downloaded");
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <Toaster position="top-right" />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1a73e8' }}>HRMS Pro <span style={{fontSize: '0.5em', verticalAlign: 'middle', opacity: 0.6}}>v2.0</span></h1>
            <p style={{ color: '#5f6368' }}>Real-time Workforce Management</p>
          </div>
          <button onClick={exportData} style={btnSecondary}><Download size={18} /> Export Report</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '25px' }}>
          {/* Dashboard Panel */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h3 style={cardTitle}>Attendance Analytics</h3>
              <Pie data={{
                labels: ['Present', 'Absent'],
                datasets: [{
                  data: [attendance.filter(a => a.status === 'Present').length, attendance.filter(a => a.status === 'Absent').length],
                  backgroundColor: ['#34a853', '#ea4335']
                }]
              }} />
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitle}><UserPlus size={18} /> New Hire Onboarding</h3>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input style={inputStyle} placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input style={inputStyle} placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <select style={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option>Developer</option><option>Designer</option><option>Manager</option>
                </select>
                <button type="submit" style={btnPrimary}>Enroll Employee</button>
              </form>
            </div>
          </aside>

          {/* Table Panel */}
          <main style={cardStyle}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{ flex: 2, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#999' }} />
                <input style={{ ...inputStyle, paddingLeft: '35px', width: '100%' }} placeholder="Search database..." onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <select style={{ flex: 1, ...inputStyle }} onChange={e => setRoleFilter(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Developer">Engineering</option>
                <option value="Designer">Creative</option>
                <option value="Manager">Management</option>
              </select>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', color: '#666', fontSize: '12px' }}>
                  <th style={{ padding: '12px' }}>EMPLOYEE</th>
                  <th style={{ padding: '12px' }}>DEPARTMENT</th>
                  <th style={{ padding: '12px' }}>DAILY LOG</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(emp => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{emp.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}><span style={badgeStyle}>{emp.role}</span></td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => handleAttendance(emp.id, 'Present')} style={btnAction}><CheckCircle size={16} color="#34a853" /></button>
                      <button onClick={() => handleAttendance(emp.id, 'Absent')} style={btnAction}><XCircle size={16} color="#ea4335" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </div>
  );
}

// Advanced Styles
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const cardTitle = { fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1f36' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' };
const btnPrimary = { background: '#1a73e8', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnSecondary = { background: '#fff', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const btnAction = { background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' };
const badgeStyle = { background: '#f1f3f4', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' };

export default App;