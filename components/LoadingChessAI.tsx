const ChessAI = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animated chess piece */}
      <div className="relative mb-6">
        <div className="
          w-20 h-20 
          rounded-2xl 
          bg-gradient-to-br from-accent/20 to-accent/5
          flex items-center justify-center
          animate-pulse
        ">
          <span className="text-4xl animate-float">♔</span>
        </div>
        
        {/* Glow effect */}
        <div className="
          absolute inset-0 
          rounded-2xl 
          bg-accent/20 
          blur-xl 
          -z-10 
          animate-pulse
        " />
      </div>
      
      {/* Loading text */}
      <div className="flex items-center gap-3 text-text-secondary">
        <div className="
          w-5 h-5 
          border-2 border-accent border-t-transparent 
          rounded-full 
          animate-spin
        " />
        <span className="text-sm font-medium">Analyzing position...</span>
      </div>
    </div>
  );
};

export default ChessAI;
