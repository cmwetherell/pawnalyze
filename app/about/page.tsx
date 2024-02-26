'use client';

import Image from "next/image";
import Link from "next/link";
//multiline tsx text string

import styled from 'styled-components';

// bold text
//hex code for neon green: #39ff14
const StyledLink = styled.a`
    font-weight: bold;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;



const About = () => {
    return (
        <main className="flex-1 flex flex-col mt-3">
        {/* <div className="flex-1 flex flex-col bg-white p-8 justify-center"> */}
          <h1 className="text-6xl font-bold text-center text-black mb-2 mt-4">About</h1>
          <p className="text-2xl text-center text-black">I'm Caleb Wetherell.</p>
          <Image
            src="/img/selfie.jpeg"
            alt="Caleb Wetherell"
            width={300}
            height={300}
            className="rounded-xl justify-center mx-auto mt-2"
            />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <p className="text-base  mb-4">Welcome to Pawnalyze, a haven for chess enthusiasts and data lovers alike! My name is Caleb Wetherell, a Seattle-based data scientist with a penchant for chess, albeit not mastering it just yet. As a serial hobbyist, I dive into intriguing projects that blend my love for data and my array of interests, with chess taking center stage on Pawnalyze.</p>
                <p className="text-base  mb-4">Pawnalyze is the culmination of my passion for data science and chess. I simulate  and make predictions for chess tournaments, and recently started analyzing the complexity of chess positions. This project reflects my journey in learning and entertainment, and I am thrilled to share it with you. For the curious minds, the code that powers these simulations is 
                <Link href='https://www.github.com/cmwetherell/cmwetherell.github.io' passHref={true}><StyledLink> available on my GitHub</StyledLink></Link>.</p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Elocator: Unveiling the Complexity of Chess Positions</h3>
                <p className="text-base  mb-4">In my continuous exploration of chess through data, I've launched a groundbreaking project named Elocator. This open-source tool is designed to predict the complexity of chess positions for humans, providing a unique lens to understand what makes a position challenging. By defining complexity as the expected change in win percentage after a move, Elocator offers a novel perspective on the game's intricate dynamics.</p>
                <p className="text-base  mb-4">Elocator operates on a dataset of FENs, analyzing the loss in win percentage when a grandmaster makes a move. Underpinned by a neural network trained on over 100,000 chess moves by grandmasters, it assigns a complexity score to positions, aiming to deepen our understanding of chess strategy. This tool not only serves as a bridge between human intuition and computational analysis but also opens new avenues for research and discussion within the chess community.</p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Recognition</h3>
                <p className="text-base  mb-4">The journey with Pawnalyze and Elocator has led to significant recognition. My analysis of the Hans Niemann chess cheating scandal caught the attention of major media outlets, including The New York Times and NPR. These features underscore the impact of our work, bridging the gap between chess analysis and broader discussions on integrity and performance in the sport.</p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Join The Journey</h3>
                <p className="text-base  mb-4">As Pawnalyze continues to evolve, so does my commitment to enhancing the chess community's understanding and appreciation of the game. Whether through the analytical insights from simulated tournaments or the groundbreaking analysis provided by Elocator, our mission remains to enrich the chess experience for players and enthusiasts around the world.</p>
                <p className="text-base  mb-4">I invite you to explore the depths of chess analytics with me and delve into the intricacies of Elocator.</p>
                <p className="text-base ">Thank you for visiting Pawnalyze. You can <Link href="https://www.twitter.com/pawnalyze/" passHref={true}><StyledLink> follow me on X/Twitter.</StyledLink></Link></p>
            </div>
          </main>
    );
}

export default About;