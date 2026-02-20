import Link from "next/link"



type chessButtonProps = {
    text: string,
    link?: string,
    onClick?: () => void
    disabled?: boolean
    width?: string
    
}

const ChessButton = ({text, link, onClick, disabled, width}: chessButtonProps) => {
    // if width is set, width, else w-48

    const buttonWidth = width ? width : "w-48"

    const busttonClassName = `${buttonWidth} font-bold py-2 px-4 rounded border-2 transition duration-300 ease-in-out ${disabled ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed' : 'bg-primary border-black text-black hover:bg-black hover:text-white'}`
    // Conditionally render Link or button based on props
    if (onClick) {
        // If onClick is provided, render a button with the onClick handler
        return (
            <div className="mt-3">
            <button
                className={busttonClassName}
                onClick={onClick}
                disabled={disabled}
            >
                {text}
                
            </button>
            </div>
        );
    } else if (link) {
        // If link is provided, render Link component
        return (
            <Link href={link} passHref>
                <button
                style={{ display: "block", margin: "0 auto" }}
                    className = {busttonClassName}
                    >
    
                        {text}
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