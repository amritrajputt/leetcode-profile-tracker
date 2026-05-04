import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export default function StudentChartModal({ student, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/tracker/student/${student.id}/history`);
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        // Format data for Recharts
        const formattedData = (result.data || []).map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          LeetCode: item.lcTotal || 0,
          GeeksForGeeks: item.gfgTotal || 0,
          Total: item.totalSolved || 0
        }));
        
        setData(formattedData);
      } catch (err) {
        toast.error("Failed to load historical data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [student]);

  if (!student) return null;

  return (
    <div className="modal-overlay fade-in-up" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '800px', padding: '24px', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', 
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer',
          padding: '8px', borderRadius: '50%', display: 'flex'
        }}>
          <X size={20} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#fff' }}>{student.name}'s Progress</h2>
        <p style={{ color: '#aaa', marginBottom: '24px' }}>Roll No: {student.rollNumber} | Batch {student.batchYear}</p>
        
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : data.length <= 1 ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#888' }}>Not enough historical data available yet. Check back tomorrow!</p>
          </div>
        ) : (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="LeetCode" dataKey="LeetCode" stroke="#FFA116" strokeWidth={3} dot={{ fill: '#111', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" name="GeeksForGeeks" dataKey="GeeksForGeeks" stroke="#2f8D46" strokeWidth={3} dot={{ fill: '#111', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
