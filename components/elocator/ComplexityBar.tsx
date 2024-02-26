interface ComplexityBarProps {
    score: number;
  }
  
  const ComplexityBar: React.FC<ComplexityBarProps> = ({ score }) => {
    const getBarColor = (score: number) => {
      if (score >= 1 && score <= 3) return 'green';
      if (score >= 4 && score <= 5) return 'yellow';
      if (score >= 6 && score <= 7) return 'orange';
      return 'red'; // For scores 8-10
    };
  
    const barStyle = {
      height: '20px',
      width: `${score * 10}%`, // Assuming score is from 1 to 10, adjust the width accordingly
      backgroundColor: getBarColor(score),
      borderRadius: '50px',
      transition: 'width 0.5s ease-in-out',
    };
  
    return (
      <div style={{ width: '100%', backgroundColor: '#ddd', borderRadius: '50px' }}>
        <div style={barStyle}></div>
      </div>
    );
  };
  
  export default ComplexityBar;