import React, { useState, useMemo } from 'react';
import { Star, MessageSquare, Award, Users } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';

export const AdminFeedbackPage = () => {
  const { reviews } = usePlacement();
  const [search, setSearch] = useState('');

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const effectiveness = useMemo(() => {
    if (reviews.length === 0) return '0%';
    const highRatings = reviews.filter((r) => r.rating >= 4).length;
    return `${Math.round((highRatings / reviews.length) * 100)}%`;
  }, [reviews]);

  const filtered = reviews.filter((r) => {
    if (!r) return false;
    const trainingName = String(r.trainingName || r.company || '');
    const comment = String(r.comment || r.experience || r.interviewExperience || '');
    const studentName = String(r.studentName || '');

    return (
      trainingName.toLowerCase().includes(search.toLowerCase()) ||
      comment.toLowerCase().includes(search.toLowerCase()) ||
      studentName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Feedback & Training Ratings</h1>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <StatCard
          title="Average Training Satisfaction"
          value={`${avgRating} / 5.0`}
          icon={Star}
          color="warning"
        />
        <StatCard
          title="Total Submissions"
          value={reviews.length}
          icon={MessageSquare}
          color="primary"
        />
        <StatCard
          title="Instructor Effectiveness"
          value={effectiveness}
          icon={Award}
          color="success"
        />
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by session title or review keyword..."
          style={{ maxWidth: 400 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <EmptyState title="No records available." />
        ) : (
          filtered.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {r.trainingName}
                  </h4>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Student: <strong>{r.studentName}</strong> • Date: {r.createdAt}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', padding: '4px 10px', borderRadius: 999, border: '1px solid #fde68a' }}>
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                      {r.rating}.0 / 5
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
                "{r.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
