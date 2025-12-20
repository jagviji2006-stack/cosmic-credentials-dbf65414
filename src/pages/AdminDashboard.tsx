import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Download, Users, RefreshCw, LogOut, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Registration {
  id: string;
  name: string;
  roll_number: string;
  email: string;
  phone: string;
  branch: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Check for valid session token
    const token = sessionStorage.getItem('adminToken');
    const adminId = sessionStorage.getItem('adminId');
    
    if (!token || !adminId) {
      navigate('/admin');
      return;
    }
    
    fetchRegistrations();
  }, [navigate]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    
    const token = sessionStorage.getItem('adminToken');
    const adminId = sessionStorage.getItem('adminId');
    
    if (!token || !adminId) {
      navigate('/admin');
      return;
    }

    try {
      // Fetch registrations via secure Edge Function
      const { data, error } = await supabase.functions.invoke('admin-registrations', {
        body: { token, adminId }
      });

      if (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to fetch registrations');
        handleLogout();
        return;
      }

      if (data?.error) {
        console.error('Auth error:', data.error);
        toast.error(data.error);
        if (data.error === 'Session expired' || data.error === 'Invalid session') {
          handleLogout();
        }
        return;
      }

      setRegistrations(data?.registrations || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (registrationId: string) => {
    const token = sessionStorage.getItem('adminToken');
    const adminId = sessionStorage.getItem('adminId');
    
    if (!token || !adminId) {
      navigate('/admin');
      return;
    }

    if (!confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    setDeletingId(registrationId);

    try {
      const { data, error } = await supabase.functions.invoke('admin-registrations', {
        body: { token, adminId, action: 'delete', registrationId }
      });

      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete registration');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Registration deleted successfully');
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete registration');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = registrations.map((r) => ({
        'Name': r.name,
        'Roll No': r.roll_number,
        'Email': r.email,
        'Phone': r.phone,
        'Branch': r.branch,
        'Date & Time': new Date(r.created_at).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      
      // Auto-width columns
      const maxWidth = 50;
      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row]).length)))
      }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `Codeathon2K25_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminId');
    navigate('/admin');
  };

  const branchCounts = registrations.reduce((acc, r) => {
    acc[r.branch] = (acc[r.branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/codeathon')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-2xl gradient-text-animated">
                Mission Control
              </h1>
              <p className="text-muted-foreground text-sm">
                CODEATHON 2K25 Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRegistrations}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border hover:border-primary transition-colors text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || registrations.length === 0}
              className="btn-cosmic flex items-center gap-2 px-4 py-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/50 hover:bg-destructive/30 transition-colors text-destructive"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
        >
          <div className="glass-panel p-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display text-primary">{registrations.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          {Object.entries(branchCounts).map(([branch, count]) => (
            <div key={branch} className="glass-panel p-4">
              <p className="text-xl font-display text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground truncate">{branch}</p>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-display text-sm text-primary">Name</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Roll No</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Email</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Phone</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Branch</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Date & Time</th>
                  <th className="text-left p-4 font-display text-sm text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading registrations...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No registrations yet. The coding journey awaits!
                    </td>
                  </tr>
                ) : (
                  registrations.map((r, index) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 text-foreground">{r.name}</td>
                      <td className="p-4 text-foreground font-mono text-sm">{r.roll_number}</td>
                      <td className="p-4 text-foreground text-sm">{r.email}</td>
                      <td className="p-4 text-foreground text-sm">{r.phone}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-display bg-primary/20 text-primary border border-primary/30">
                          {r.branch}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/20 border border-destructive/50 hover:bg-destructive/30 transition-colors text-destructive text-sm disabled:opacity-50"
                        >
                          <Trash2 className={`w-3 h-3 ${deletingId === r.id ? 'animate-spin' : ''}`} />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
