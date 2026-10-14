import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { ANIMAL_AVATARS } from '../../data/animalAvatars';

export const ProfilePictureModal = () => {
  const {
    isProfilePicModalOpen,
    closeProfilePicModal,
    currentUser,
    updateProfileAvatar,
    showToast
  } = usePlacement();

  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [activeTab, setActiveTab] = useState('animals'); // 'animals' | 'upload'
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  // Sync with current user's avatar when opened
  useEffect(() => {
    if (isProfilePicModalOpen) {
      setSelectedAvatar(currentUser?.avatar || '');
      setFileError('');
      setActiveTab('animals');
    }
  }, [isProfilePicModalOpen, currentUser]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isProfilePicModalOpen) {
        closeProfilePicModal();
      }
    };
    if (isProfilePicModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfilePicModalOpen, closeProfilePicModal]);

  if (!isProfilePicModalOpen) return null;

  // Process image file
  const handleFile = (file) => {
    setFileError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedAvatar(e.target.result);
      }
    };
    reader.onerror = () => {
      setFileError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  // Find animal info if selected
  const currentAnimal = ANIMAL_AVATARS.find((a) => a.dataUrl === selectedAvatar);

  const handleSave = () => {
    updateProfileAvatar(selectedAvatar);
    closeProfilePicModal();
  };

  const handleRemove = () => {
    setSelectedAvatar('');
    updateProfileAvatar('');
    closeProfilePicModal();
  };

  return (
    <div className="modal-overlay" onClick={closeProfilePicModal}>
      <div
        className="modal-content"
        style={{
          maxWidth: '580px',
          width: '95%',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Sparkles size={18} color="var(--primary)" />
              Profile Picture
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Choose a cute animal avatar or upload your custom picture
            </p>
          </div>
          <button
            onClick={closeProfilePicModal}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              padding: 6,
              borderRadius: '8px',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="modal-body"
          style={{
            padding: '20px 24px',
            maxHeight: 'calc(80vh - 140px)',
            overflowY: 'auto'
          }}
        >
          {/* Live Preview Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 18px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: 20
            }}
          >
            {/* Circular Preview Container */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: selectedAvatar ? '2px solid var(--primary)' : '2px dashed #cbd5e1',
                backgroundColor: selectedAvatar ? '#ffffff' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selectedAvatar ? '0 4px 12px rgba(37,99,235,0.15)' : 'none'
              }}
            >
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Avatar preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                /* Completely blank profile picture area - no initials, no icons */
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9' }} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Current Selection
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>
                {selectedAvatar
                  ? currentAnimal
                    ? currentAnimal.name
                    : 'Uploaded Custom Picture'
                  : 'Blank (No Profile Picture)'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedAvatar
                  ? 'This picture will appear across all your navigation bars and profile.'
                  : 'No picture is currently set. Select an animal avatar or upload your photo below.'}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid var(--border-color)',
              marginBottom: 18
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('animals')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'animals' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                color: activeTab === 'animals' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'animals' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s'
              }}
            >
              <span>Cute Animal Avatars</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'animals' ? '#eff6ff' : '#f1f5f9',
                  color: activeTab === 'animals' ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                {ANIMAL_AVATARS.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'upload' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                color: activeTab === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === 'upload' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s'
              }}
            >
              <Upload size={15} />
              <span>Upload Picture</span>
            </button>
          </div>

          {/* TAB 1: Cute Animal Avatars Grid */}
          {activeTab === 'animals' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                  gap: 12
                }}
              >
                {ANIMAL_AVATARS.map((animal) => {
                  const isSelected = selectedAvatar === animal.dataUrl;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setSelectedAvatar(animal.dataUrl)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 6px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 10px rgba(37,99,235,0.18)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {/* Avatar Image */}
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                      >
                        <img
                          src={animal.dataUrl}
                          alt={animal.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Name */}
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%'
                        }}
                      >
                        {animal.name}
                      </span>

                      {/* Check badge when selected */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Upload Picture */}
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--primary)' : '#cbd5e1'}`,
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  if (!dragActive) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px'
                  }}
                >
                  <Upload size={24} />
                </div>

                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                  Click to browse or drag & drop image here
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Supports PNG, JPG, JPEG, WEBP, or SVG (Up to 5MB)
                </div>

                <button
                  type="button"
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Browse Device
                </button>
              </div>

              {fileError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '10px 14px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    fontWeight: 500
                  }}
                >
                  {fileError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            gap: 12
          }}
        >
          {/* Remove Picture Option */}
          <div>
            {(currentUser?.avatar || selectedAvatar) ? (
              <button
                type="button"
                onClick={handleRemove}
                title="Remove picture and return to completely blank profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#fee2e2';
                }}
              >
                <Trash2 size={15} />
                <span>Remove Picture</span>
              </button>
            ) : null}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={closeProfilePicModal}
              style={{
                padding: '9px 18px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '9px 20px',
                backgroundColor: 'var(--primary)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              Save Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
