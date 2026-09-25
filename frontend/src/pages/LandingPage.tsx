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

  // O botão está aproximadamente nas coordenadas:
  // X: 64% a 89% da largura
  // Y: 74% a 83% da altura
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    left: '64%',
    top: '74%',
    width: '25%',
    height: '9%',
    cursor: 'pointer',
    zIndex: 10,
    // border: '2px solid red' // Descomente para debugar a posição
  };

  const containerStyle: React.CSSProperties = isPortrait
    ? {
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100vh',
        height: '100vw',
        transform: 'rotate(-90deg)',
        transformOrigin: 'left top',
        backgroundColor: '#000509',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }
    : {
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
    aspectRatio: '16/9', // A imagem aparenta ser 16:9
    maxWidth: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={imageContainerStyle}>
        <img 
          src="/lontraai.png" 
          alt="Lontra AI Landing Page" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        <div 
          style={buttonStyle} 
          onClick={() => navigate('/app')}
          title="Testar Lontra AI"
        />
      </div>
    </div>
  );
};

export default LandingPage;
