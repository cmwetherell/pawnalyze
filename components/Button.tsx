import Link from "next/link"

type ChessButtonProps = {
    text: string;
    link?: string;
    onClick?: () => void;
    disabled?: boolean;
    width?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const ChessButton = ({ 
  text, 
  link, 
  onClick, 
  disabled, 
  width,
  variant = 'primary',
  size = 'md'
}: ChessButtonProps) => {
    // Size classes
    const sizeClasses = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    };
    
    // Variant classes
    const variantClasses = {
      primary: `
        relative overflow-hidden
        bg-gradient-to-r from-accent to-accent-light
        text-bg-primary font-semibold
        rounded-lg
        shadow-glow-sm
        transition-all duration-300 ease-out-expo
        hover:shadow-glow-md hover:scale-[1.02]
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        before:absolute before:inset-0 
        before:bg-gradient-to-r before:from-white/20 before:to-transparent
        before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
      `,
      secondary: `
        relative
        bg-transparent
        text-text-primary font-semibold
        rounded-lg
        border border-border-subtle
        transition-all duration-300 ease-out-expo
        hover:border-accent hover:text-accent hover:bg-accent/5
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      ghost: `
        relative
        bg-transparent
        text-text-secondary font-medium
        rounded-lg
        transition-all duration-300 ease-out-expo
        hover:text-text-primary hover:bg-white/5
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
      `
    };

    const buttonClassName = `
      inline-flex items-center justify-center
      uppercase tracking-wider
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${width || 'min-w-[140px]'}
    `;

    // If onClick is provided, render a button with the onClick handler
    if (onClick) {
        return (
            <button
                className={buttonClassName}
                onClick={onClick}
                disabled={disabled}
            >
                <span className="relative z-10">{text}</span>
            </button>
        );
    } else if (link) {
        // If link is provided, render Link component
        return (
            <Link href={link} passHref>
                <button className={buttonClassName}>
                    <span className="relative z-10">{text}</span>
                </button>
            </Link>
        );
    } else {
        // Fallback or error handling if neither link nor onClick is provided
        console.error('ChessButton requires either a link or an onClick handler');
        return null;
    }
}

export default ChessButton;
