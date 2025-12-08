import Link from "next/link";
import { cn } from "@/lib/utils";

type ChessButtonProps = {
  text: string;
  link?: string;
  onClick?: () => void;
  disabled?: boolean;
  width?: string;
};

const ChessButton = ({ text, link, onClick, disabled, width }: ChessButtonProps) => {
  const buttonWidth = width ? width : "min-w-[11rem]";

  const baseClassName = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em]",
    "bg-gradient-to-r from-mint/20 via-transparent to-brass/35 text-paper shadow-glow transition duration-300",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint/60",
    buttonWidth,
    disabled
      ? "cursor-not-allowed opacity-50"
      : "hover:-translate-y-0.5 hover:border-mint/60 hover:shadow-[0_0_35px_rgba(114,245,199,0.5)]"
  );

  const Content = (
    <>
      <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <span className="absolute inset-0 bg-gradient-to-r from-mint/30 via-transparent to-brass/45 blur-xl" />
      </span>
      <span className="relative z-10">{text}</span>
    </>
  );

  if (onClick) {
    return (
      <button className={baseClassName} onClick={onClick} disabled={disabled}>
        {Content}
      </button>
    );
  }

  if (link) {
    return (
      <Link href={link} passHref className="inline-flex justify-center">
        <span className={baseClassName}>{Content}</span>
      </Link>
    );
  }

  console.error("ChessButton requires either a link or an onClick handler");
  return null;
};

export default ChessButton;
