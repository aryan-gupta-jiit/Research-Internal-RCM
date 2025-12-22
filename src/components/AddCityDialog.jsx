import { useState } from "react";

export function AddCityDialog({ open, onOpenChange, onAddCity }) {
  const [cityName, setCityName] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    try {
      setLoading(true);
      await onAddCity({
        cityName: cityName.trim(),
        coverImage: coverImage.trim() || undefined,
        content: content.trim() || undefined,
      });
      // reset fields
      setCityName("");
      setCoverImage("");
      setContent("");
    } finally {
      setLoading(false);
    }
  };


  if (!open) return null;

  return (
    <>
      <div className="dialog-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}>
        <div className="dialog-content" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dbeafe',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: '90%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div className="dialog-header" style={{ padding: '1.5rem 1.5rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  Add New City
                </h2>
                <p style={{ color: '#475569', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  Provide details about the city to add it to the system.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', paddingTop: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="cityName" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
                City Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="cityName"
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city name"
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#bfdbfe';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="coverImage" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
                Cover Image URL <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="coverImage"
                  type="text"
                  value={coverImage}
                  required
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#bfdbfe';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (coverImage.trim()) {
                      setPreviewUrl(coverImage);
                      setShowPreview(true);
                    }
                  }}
                  disabled={!coverImage.trim()}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.375rem',
                    backgroundColor: coverImage.trim() ? 'white' : '#f1f5f9',
                    cursor: coverImage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: coverImage.trim() ? '#2563eb' : '#94a3b8',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (coverImage.trim()) {
                      e.target.style.backgroundColor = '#dbeafe';
                      e.target.style.borderColor = '#93c5fd';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (coverImage.trim()) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.borderColor = '#bfdbfe';
                    }
                  }}
                >
                  <svg style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="content" style={{ display: 'block', color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="content"
                value={content}
                required
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a short description about this city..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#bfdbfe';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid #dbeafe'
            }}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.375rem',
                  color: '#2563eb',
                  backgroundColor: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.target.style.backgroundColor = '#dbeafe';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !cityName.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '0.375rem',
                  color: 'white',
                  border: 'none',
                  cursor: (loading || !cityName.trim()) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !cityName.trim()) ? 0.6 : 1,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading && cityName.trim()) {
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }}
              >
                <svg style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {loading ? "Adding..." : "Add City"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {
        showPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '2rem'
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem', color: '#64748b' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  display: 'block',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<div style="padding: 2rem; text-align: center; color: #ef4444;">Failed to load image</div>';
                }}
              />
            </div>
          </div>
        )}
    </>
  );
}