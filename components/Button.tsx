import Link from "next/link"

type chessButtonProps = {
    text: string,
    link?: string,
    onClick?: () => void
    disabled?: boolean
    width?: string
}

const ChessButton = ({text, link, onClick, disabled, width}: chessButtonProps) => {
    const buttonWidth = width ? width : "w-48"

    const buttonClassName = `${buttonWidth} font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
        disabled
            ? 'bg-[var(--bg-surface-3)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-chess-gold text-chess-dark hover:bg-chess-gold-light hover:shadow-gold'
    }`

    if (onClick) {
        return (
            <div className="mt-3">
                <button
                    className={buttonClassName}
                    onClick={onClick}
                    disabled={disabled}
                >
                    {text}
                </button>
            </div>
        );
    } else if (link) {
        return (
            <Link href={link} passHref>
                <button
                    style={{ display: "block", margin: "0 auto" }}
                    className={buttonClassName}
                >
                    {text}
                </button>
            </Link>
        );
    } else {
        console.error('ChessButton requires either a link or an onClick handler');
        return null;
    }
}

export default ChessButton;
