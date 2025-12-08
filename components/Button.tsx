import Link from "next/link";

type ChessButtonProps = {
  text: string;
  link?: string;
  onClick?: () => void;
  disabled?: boolean;
  width?: string;
  variant?: "primary" | "secondary" | "ghost";
};

const baseClass =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/70 disabled:cursor-not-allowed";

const variantClasses: Record<NonNullable<ChessButtonProps["variant"]>, string> = {
  primary:
    "border-amber/40 bg-gradient-to-br from-amber/40 via-transparent to-transparent text-sand hover:border-amber/80 hover:text-ink",
  secondary:
    "border-white/20 bg-white/5 text-sand hover:border-mint/60 hover:text-mint",
  ghost: "border-white/10 text-sand hover:border-amber/40 hover:text-amber",
};

const ChessButton = ({
  text,
  link,
  onClick,
  disabled,
  width,
  variant = "primary",
}: ChessButtonProps) => {
  const buttonWidth = width ?? "min-w-[11rem]";
  const className = `${baseClass} ${variantClasses[variant]} ${buttonWidth} ${
    disabled ? "opacity-60" : ""
  }`;

  const content = (
    <>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"></span>
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-x-2 bottom-1 h-px bg-gradient-to-r from-transparent via-amber/60 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} disabled={disabled}>
        {content}
      </button>
    );
  }

  if (link) {
    return (
      <Link href={link} className={`${className} text-center`}>
        {content}
      </Link>
    );
  }

  console.error("ChessButton requires either a link or an onClick handler");
  return null;
};

export default ChessButton;