import Link from "next/link"

type chessButtonProps = {
    text: string,
    link?: string,
    onClick?: () => void
    disabled?: boolean
    width?: string
    variant?: 'primary' | 'secondary'
}

const ChessButton = ({text, link, onClick, disabled, width, variant = 'primary'}: chessButtonProps) => {
    const buttonWidth = width ? width : "w-56"
    
    const baseClasses = `${buttonWidth} relative group font-display font-semibold tracking-wide py-3 px-8 transition-elegant overflow-hidden`
    
    const primaryClasses = "bg-gold text-ink border-2 border-gold hover:bg-gold-dark hover:border-gold-dark shadow-glow hover:shadow-elegant"
    const secondaryClasses = "bg-transparent text-gold border-2 border-gold/50 hover:border-gold hover:bg-gold/10"
    
    const buttonClasses = variant === 'primary' 
        ? `${baseClasses} ${primaryClasses}`
        : `${baseClasses} ${secondaryClasses}`
    
    const buttonContent = (
        <>
            <span className="relative z-10 flex items-center justify-center">
                {text}
                <svg 
                    className="ml-2 w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-elegant" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </span>
            {variant === 'primary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-gold-light/20 to-gold/20 opacity-0 group-hover:opacity-100 transition-elegant"></div>
            )}
        </>
    )
    
    if (onClick) {
        return (
            <button
                className={`${buttonClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={onClick}
                disabled={disabled}
            >
                {buttonContent}
            </button>
        );
    } else if (link) {
        return (
            <Link href={link} className="inline-block">
                <button className={buttonClasses}>
                    {buttonContent}
                </button>
            </Link>
        );
    } else {
        console.error('ChessButton requires either a link or an onClick handler');
        return null;
    }
}

export default ChessButton;