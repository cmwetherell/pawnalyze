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
    const buttonWidth = width ? width : "w-48"
    
    const baseClasses = `
        ${buttonWidth}
        relative
        group
        font-body font-semibold
        tracking-wide
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
    `
    
    const primaryClasses = `
        ${baseClasses}
        bg-luxury-amber/10
        border-2 border-luxury-amber
        text-luxury-gold
        py-3 px-8
        hover:bg-luxury-amber/20
        hover:shadow-gold
        hover:-translate-y-0.5
        active:translate-y-0
    `
    
    const secondaryClasses = `
        ${baseClasses}
        bg-transparent
        border-2 border-luxury-cream/30
        text-luxury-cream/90
        py-3 px-8
        hover:border-luxury-amber
        hover:text-luxury-gold
        hover:bg-luxury-amber/5
    `
    
    const buttonClassName = variant === 'primary' ? primaryClasses : secondaryClasses
    
    // Shimmer effect overlay
    const shimmerOverlay = (
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent" />
    )
    
    if (onClick) {
        return (
            <button
                className={buttonClassName}
                onClick={onClick}
                disabled={disabled}
            >
                {shimmerOverlay}
                <span className="relative z-10">{text}</span>
            </button>
        );
    } else if (link) {
        return (
            <Link href={link} passHref className="block">
                <button
                    className={buttonClassName}
                    disabled={disabled}
                >
                    {shimmerOverlay}
                    <span className="relative z-10">{text}</span>
                </button>
            </Link>
        );
    } else {
        console.error('ChessButton requires either a link or an onClick handler');
        return null;
    }
}

export default ChessButton;