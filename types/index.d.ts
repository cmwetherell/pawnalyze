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
    outcome?: null | string;
    round?: number;
  };
