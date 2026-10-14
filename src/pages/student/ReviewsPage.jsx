import React, { useState } from 'react';
import { Star, Send, MessageSquare, CheckCircle2, User } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

export const ReviewsPage = () => {
  const { reviews, training, addReview, studentProfile } = usePlacement();

  const [selectedTrainingId, setSelectedTrainingId] = useState(training[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [trainerRating, setTrainerRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const selectedTraining = training.find((t) => t.id === selectedTrainingId);

    addReview({
      trainingId: selectedTrainingId,
      trainingName: selectedTraining?.name || 'Training Session',
      rating,
      trainerRating,
      comment
    });

    setComment('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews & Feedback</h1>
        </div>
      </div>

      <div className="grid-3">
        {/* Left Col: Feedback Submission Form */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>
            <MessageSquare size={18} color="var(--primary)" />
            Submit Training Review
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Training Module</label>
              <select
                className="form-select"
                value={selectedTrainingId}
                onChange={(e) => setSelectedTrainingId(e.target.value)}
                required
              >
                <option value="">Select Training Module</option>
                {training.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Star Rating */}
            <div className="form-group">
              <label className="form-label">Overall Session Rating</label>
              <div style={{ display: 'flex', gap: 6, margin: '4px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2
                    }}
                  >
                    <Star
                      size={24}
                      fill={(hoverRating || rating) >= star ? '#f59e0b' : 'transparent'}
                      color={(hoverRating || rating) >= star ? '#f59e0b' : '#cbd5e1'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', alignSelf: 'center', marginLeft: 8 }}>
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Trainer Knowledge Rating */}
            <div className="form-group">
              <label className="form-label">Instructor & Delivery Rating</label>
              <div style={{ display: 'flex', gap: 6, margin: '4px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTrainerRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2
                    }}
                  >
                    <Star
                      size={20}
                      fill={trainerRating >= star ? '#3b82f6' : 'transparent'}
                      color={trainerRating >= star ? '#3b82f6' : '#cbd5e1'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 6 }}>
                  {trainerRating} / 5
                </span>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="form-group">
              <label className="form-label">Detailed Comments & Suggestions</label>
              <textarea
                className="form-textarea"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter feedback and comments"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginTop: 8 }}
              icon={Send}
            >
              Submit Review
            </Button>
          </form>
        </div>

        {/* Right 2 Cols: Recent Submitted Reviews */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Star size={18} color="#f59e0b" />
                Training Reviews ({reviews.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.length === 0 ? (
                <EmptyState title="No records available." />
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {rev.trainingName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
                            Submitted by: <strong>{rev.studentName}</strong>
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>• {rev.createdAt}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', padding: '4px 10px', borderRadius: 999, border: '1px solid #fde68a' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400e' }}>
                          {rev.rating}.0
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6, backgroundColor: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
