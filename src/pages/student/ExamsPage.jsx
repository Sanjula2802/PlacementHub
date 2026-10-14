import React, { useState } from 'react';
import { FileText, Calendar, Clock, Award, Shield, CheckCircle2, Play } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

export const ExamsPage = () => {
  const { exams } = usePlacement();
  const [selectedExam, setSelectedExam] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Exams & Pre-Placement Assessments</h1>
        </div>
      </div>

      {exams.length === 0 ? (
        <EmptyState title="No records available." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              borderLeft: `5px solid ${exam.status === 'Completed' ? 'var(--success)' : 'var(--primary)'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Badge variant={exam.status === 'Completed' ? 'success' : 'primary'}>
                    {exam.status}
                  </Badge>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{exam.type}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                  {exam.name}
                </h3>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Platform: <strong>{exam.platform}</strong> • Total Marks: <strong>{exam.totalMarks}</strong>
                </div>
              </div>

              {exam.status === 'Completed' && exam.score && (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
                    Score Secured
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>
                    {exam.score}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    {exam.rank}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Syllabus: </span>
              <span style={{ color: 'var(--text-muted)' }}>{exam.syllabus}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderTop: '1px solid var(--border-color)',
                paddingTop: 12
              }}
            >
              <div style={{ display: 'flex', gap: 18, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} color="var(--primary)" /> {exam.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={14} color="var(--primary)" /> {exam.time} ({exam.duration})
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => setSelectedExam(exam)}>
                  View Details & Instructions
                </Button>
                {exam.status === 'Upcoming' && (
                  <Button variant="primary" size="sm" icon={Play} onClick={() => setSelectedExam(exam)}>
                    Start Assessment Portal
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Details & Instructions Modal */}
      {selectedExam && (
        <Modal
          isOpen={!!selectedExam}
          onClose={() => setSelectedExam(null)}
          title={selectedExam.name}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setSelectedExam(null)}>
              Close
            </Button>
          }
        >
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Badge variant={selectedExam.status === 'Completed' ? 'success' : 'primary'}>{selectedExam.status}</Badge>
                <Badge variant="neutral">{selectedExam.type}</Badge>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Platform: <strong>{selectedExam.platform}</strong></p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>Scheduled Timing:</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                Date: <strong>{selectedExam.date}</strong> • Window: <strong>{selectedExam.time}</strong> • Time Limit: <strong>{selectedExam.duration}</strong>
              </p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>Testing Syllabus:</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{selectedExam.syllabus}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>Proctoring Guidelines:</h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{selectedExam.instructions}</p>
            </div>

            {selectedExam.score && (
              <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', color: '#065f46', fontSize: '0.875rem', fontWeight: 600 }}>
                Score: {selectedExam.score} • Overall Standing: {selectedExam.rank}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExamsPage;
