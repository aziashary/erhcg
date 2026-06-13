import React from 'react';

export default function SkeletonForm() {
  return (
    <div className="form-container skeleton-container" style={{ padding: '30px' }}>
      <div className="skeleton-box" style={{ height: '35px', width: '30%', marginBottom: '20px' }}></div>
      <div className="skeleton-box" style={{ height: '55px', width: '100%', marginBottom: '15px' }}></div>
      <div className="skeleton-box" style={{ height: '55px', width: '100%', marginBottom: '15px' }}></div>
      <div className="skeleton-box" style={{ height: '55px', width: '100%', marginBottom: '30px' }}></div>
      
      <div className="skeleton-box" style={{ height: '35px', width: '40%', marginBottom: '20px' }}></div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <div className="skeleton-box" style={{ height: '55px', flex: 1 }}></div>
        <div className="skeleton-box" style={{ height: '55px', flex: 1 }}></div>
      </div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <div className="skeleton-box" style={{ height: '55px', flex: 1 }}></div>
        <div className="skeleton-box" style={{ height: '55px', flex: 1 }}></div>
      </div>

      <div className="skeleton-box" style={{ height: '35px', width: '30%', marginBottom: '20px' }}></div>
      <div className="skeleton-box" style={{ height: '100px', width: '100%', marginBottom: '15px' }}></div>
      <div className="skeleton-box" style={{ height: '100px', width: '100%', marginBottom: '15px' }}></div>
      
      <div className="skeleton-box" style={{ height: '55px', width: '100%', marginTop: '30px' }}></div>
    </div>
  );
}
