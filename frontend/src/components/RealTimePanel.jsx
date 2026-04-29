import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, Calendar, Loader2 } from 'lucide-react';

// Simple status indicator (colored dot) based on DB status string
const DatabaseStatusIcon = ({ status }) => {
  const colorMap = {
    PostgreSQL: 'bg-emerald-500',
    'FileDB (Persistent)': 'bg-amber-500',
    error: 'bg-red-500',
    unknown: 'bg-gray-400',
  };
  const bg = colorMap[status] || colorMap['unknown'];
  return <span className={`inline-block w-3 h-3 rounded-full ${bg}`} />;
};

const RealTimePanel = () => {
  const [clientTime, setClientTime] = useState(new Date());
  const [serverStatus, setServerStatus] = useState({ database: 'unknown' });
  const [uptimeSec, setUptimeSec] = useState(0);

  // Update client clock every second
  useEffect(() => {
    const timer = setInterval(() => setClientTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch server health initially and every 30 seconds
  const fetchHealth = async () => {
    try {
      const res = await axios.get('/api/health');
      setServerStatus(res.data);
    } catch (e) {
      console.error('Health check failed', e);
      setServerStatus({ database: 'error' });
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Uptime since component mount
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setUptimeSec(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = sec => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <section className="bg-white/70 backdrop-blur-md border-t border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-6 rounded-[2rem] shadow-sm">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Client Time: {clientTime.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Server DB: {serverStatus.database || 'unknown'}</span>
        <DatabaseStatusIcon status={serverStatus.database} />
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Uptime: {formatUptime(uptimeSec)}</span>
      </div>
    </section>
  );
};

export default RealTimePanel;
