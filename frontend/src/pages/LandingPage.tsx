import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const buttonStyleHorizontal: React.CSSProperties = {
    position: 'absolute',
    left: '64%',
    top: '74%',
    width: '25%',
    height: '9%',
    cursor: 'pointer',
    zIndex: 10,
  };

  const buttonStyleVertical: React.CSSProperties = {
    position: 'absolute',
    left: '15%',
    top: '84%',
    width: '70%',
    height: '8%',
    cursor: 'pointer',
    zIndex: 10,
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000509',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    aspectRatio: isPortrait ? '9/16' : '16/9',
    maxWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={imageContainerStyle}>
        <img 
          src={isPortrait ? "/lontraaivertical.jfif" : "/lontraai.png"} 
          alt="Lontra AI Landing Page" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div 
          style={isPortrait ? buttonStyleVertical : buttonStyleHorizontal} 
          onClick={() => navigate('/app')}
          title="Testar Lontra AI"
        />
      </div>
    </div>
  );
};

export default LandingPage;
