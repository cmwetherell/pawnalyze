import Link from "next/link"

type ChessButtonProps = {
  text: string
  link?: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: React.ReactNode
}

const ChessButton = ({
  text,
  link,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
  icon
}: ChessButtonProps) => {
  
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold tracking-wide uppercase
    transition-all duration-300 ease-out-expo
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-obsidian-950
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-amber-500 to-amber-600
      text-obsidian-950
      hover:shadow-[0_10px_30px_-5px_rgba(251,191,36,0.4)]
      hover:translate-y-[-2px]
      active:translate-y-0
      relative overflow-hidden
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:-translate-x-full before:hover:translate-x-full
      before:transition-transform before:duration-700
    `,
    secondary: `
      bg-transparent
      text-ivory-100
      border border-white/10
      hover:border-amber-400/50
      hover:bg-amber-400/5
      hover:text-amber-400
    `,
    ghost: `
      bg-transparent
      text-obsidian-400
      hover:text-ivory-100
      hover:bg-white/5
    `
  }

  const sizes = {
    sm: 'text-xs px-4 py-2 rounded-md',
    md: 'text-sm px-6 py-3 rounded-lg',
    lg: 'text-base px-8 py-4 rounded-xl'
  }

  const buttonClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  const ButtonContent = () => (
    <>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="relative z-10">{text}</span>
    </>
  )

  if (onClick) {
    return (
      <button
        className={buttonClassName}
        onClick={onClick}
        disabled={disabled}
      >
        <ButtonContent />
      </button>
    )
  } else if (link) {
    return (
      <Link href={link} className={buttonClassName}>
        <ButtonContent />
      </Link>
    )
  } else {
    console.error('ChessButton requires either a link or an onClick handler')
    return null
  }
}

export default ChessButton
