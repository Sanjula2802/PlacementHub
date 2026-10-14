import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Megaphone,
  Award
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';

export const AdminDashboard = () => {
  const {
    students,
    drives,
    jobs,
    announcements,
    queries,
    addAnnouncement
  } = usePlacement();

  const navigate = useNavigate();

  // Announcement modal state
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('Placement Guideline');
  const [annPriority, setAnnPriority] = useState('High');

  const pendingQueriesCount = queries.filter((q) => q.status === 'Pending').length;

  // Real benchmarks computed dynamically from live API data
  const drivePackages = drives
    .map((d) => {
      const val = parseFloat(d.packageValue || (d.package ? String(d.package).replace(/[^0-9.]/g, '') : 0));
      return isNaN(val) ? 0 : val;
    })
    .filter((v) => v > 0);

  const highestPackage = drivePackages.length > 0 ? Math.max(...drivePackages) : 0;
  const avgPackage = drivePackages.length > 0
    ? (drivePackages.reduce((a, b) => a + b, 0) / drivePackages.length).toFixed(1)
    : 0;

  const totalOffers = students.reduce((acc, s) => {
    const offers = parseInt(s.offersCount || (s.placementStatus === 'Placed' ? 1 : 0), 10);
    return acc + (isNaN(offers) ? 0 : offers);
  }, 0);

  // Department Placement Progression for 7 required departments
  const deptList = ['CSE', 'CSE-AI/ML', 'CSE-DS', 'ECE', 'EEE', 'MECH', 'AERO'];
  const deptStats = deptList.map((dept) => {
    const deptStudents = students.filter((s) => s.department === dept);
    const placedStudents = deptStudents.filter((s) => s.placementStatus === 'Placed' || (parseInt(s.offersCount, 10) > 0));
    const percentage = deptStudents.length > 0
      ? Math.round((placedStudents.length / deptStudents.length) * 100)
      : 0;
    return {
      department: dept,
      total: deptStudents.length,
      placed: placedStudents.length,
      percentage
    };
  });
  const hasDeptStudents = students.length > 0;

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      category: annCategory,
      priority: annPriority
    });

    setAnnTitle('');
    setAnnContent('');
    setIsAnnModalOpen(false);
  };

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.25)',
                color: '#fef08a',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(254, 240, 138, 0.3)'
              }}
            >
              Dean / TPO Command Center
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Placement Portal</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
            University Placement Administration
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/drives')}
            icon={Building2}
          >
            Manage Drives
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsAnnModalOpen(true)}
            icon={Megaphone}
          >
            Broadcast Announcement
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          title="Total Registered Students"
          value={students.length}
          icon={Users}
          color="primary"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Total Placement Drives"
          value={drives.length}
          icon={Building2}
          color="warning"
          onClick={() => navigate('/admin/drives')}
        />
        <StatCard
          title="Active Full-Time Jobs"
          value={jobs.length}
          icon={Briefcase}
          color="purple"
          onClick={() => navigate('/admin/jobs')}
        />
        <StatCard
          title="Pending Student Queries"
          value={pendingQueriesCount}
          icon={TrendingUp}
          color="info"
          onClick={() => navigate('/admin/queries')}
        />
      </div>

      {/* Placement Statistics Overview */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Department Placement Rates */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Award size={18} color="var(--primary)" />
              Department Placement Progression
            </h3>
          </div>

          {!hasDeptStudents ? (
            <EmptyState title="No records available." description="" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {deptStats.map((item) => (
                <div
                  key={item.department}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.department}</span>
                    <span style={{ fontWeight: 700, color: item.percentage >= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {item.placed} / {item.total} Placed ({item.percentage}%)
                    </span>
                  </div>
                  <ProgressBar value={item.percentage} showPercentage={false} height={6} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salary Highlights Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Placement Benchmarks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>
                Highest Package Offered
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e40af', marginTop: 2 }}>
                {highestPackage > 0 ? `${highestPackage} LPA` : '0 LPA'}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                Average Campus Package
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#065f46', marginTop: 2 }}>
                {avgPackage > 0 ? `${avgPackage} LPA` : '0 LPA'}
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Offers Rolled Out
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b45309', marginTop: 2 }}>
                {totalOffers}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Drives & Action Center */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building2 size={18} color="var(--primary)" />
              Active Placement Drives
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/drives')}>
              All Drives
            </Button>
          </div>

          {drives.length === 0 ? (
            <EmptyState title="No placement drives available." description="" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drives.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{d.company}</div>
                    <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                      {d.role} • {d.package}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge variant="primary">{d.registeredStudents?.length || 0} Registered</Badge>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 4 }}>
                      Drive: {d.driveDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Announcement Broadcast */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Megaphone size={18} color="#ef4444" />
              Live Campus Announcements ({announcements.length})
            </h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/announcements')}>
              Manage
            </Button>
          </div>

          {announcements.length === 0 ? (
            <EmptyState title="No notifications." description="" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Badge variant={a.priority === 'High' ? 'danger' : 'primary'}>{a.priority}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{a.date}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{a.title}</div>
                  <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: 4, lineClamp: 2 }}>
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title="Post Campus Placement Announcement"
      >
        <form onSubmit={handlePostAnnouncement}>
          <div className="form-group">
            <label className="form-label">Announcement Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Enter announcement title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={annCategory}
              onChange={(e) => setAnnCategory(e.target.value)}
            >
              <option value="Placement Guideline">Placement Guideline</option>
              <option value="Company Visit">Company Visit</option>
              <option value="Certifications">Certifications</option>
              <option value="Campus Protocol">Campus Protocol</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Urgency / Priority</label>
            <select
              className="form-select"
              value={annPriority}
              onChange={(e) => setAnnPriority(e.target.value)}
            >
              <option value="High">High - Urgent Action Required</option>
              <option value="Normal">Normal - Information Broadcast</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Body</label>
            <textarea
              rows={4}
              required
              className="form-textarea"
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Enter message to be broadcasted to all students..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsAnnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
