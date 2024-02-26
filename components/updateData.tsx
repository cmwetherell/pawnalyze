"use client";

import React from "react";

const ExamplePost = () => {
  const handleButtonClick = async () => {
    const gameFilters = {
      gameFilters: [
        {
          whitePlayer: "Caruana, Fabiano",
          blackPlayer: "Abasov, Nijat",
          outcome: 1.0,
        },
        // Add more filters as needed
      ],
    };

    const limitSims = 10;

    try {
      const response = await fetch("/api/sims", {
        // Update '/api/sims' to your actual endpoint URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameFilters, limitSims }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data); // Prints the response from the API to the console
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Fetch Games</button>
    </div>
  );
};

export default ExamplePost;
