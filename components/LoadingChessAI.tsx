import Image from "next/image";
import chessaipic from "../public/img/chess-complexity-ai.png"


const ChessAI = () => {
    return (
        <div>
            <h1>Chess AI</h1>
            <Image
                src={chessaipic}
                alt="AI Chess Board"
                width={500}
                height={500}
            />
        </div>
    )
}

export default ChessAI;