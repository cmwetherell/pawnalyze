export type SiteConfig = {
    name: string
    description: string
    url: string
    ogImage: string
    links: {
      twitter: string
      github: string
    }
    metadataBase: string
  }

  // Example game data type
export type Game = {
    id: string;
    whitePlayer: string;
    blackPlayer: string;
    outcome?: 'white' | 'draw' | 'black' | null; // Add outcome to the game object 
  };

export type PercentageData = {
    name: string;
    value: number;
  };

export type PlayerColorsMap = {
    [key: string]: string;
  };

export type CurrentPredictionsProps = {
    nsims: number;
    gameFilters?: Game[];
    updateTrigger?: number; // Add an optional updateTrigger prop
  };