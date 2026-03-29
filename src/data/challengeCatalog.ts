export interface Venue {
  id: string;
  name: string;
  neighborhood: string;
  cuisine: string;
  description: string;
  imageUrl: string;
}

export interface Challenge {
  id: string;
  name: string;
  theme: 'cuisine' | 'occasion' | 'neighborhood' | 'seasonal' | 'format';
  city: string;
  description: string;
  qualifyingVenues: Venue[];
  requiredVisits: number;
  startsAt: string;
  endsAt: string;
  rewardType: 'priority_notify' | 'exclusive_experience' | 'early_access' | 'surprise_perk';
  rewardDescription: string;
  editorialTag: string;
}

export const challengeCatalog: Challenge[] = [
  {
    id: 'nyc-burger-2026-q2',
    name: 'The Burger City Edit',
    theme: 'cuisine',
    city: 'nyc',
    description:
      "Hit 4 of NYC's most talked-about burger spots — from diner classics to chef-driven smashes. Our editors picked these specifically. You'll eat well.",
    qualifyingVenues: [
      {
        id: 'v_minetta',
        name: 'Minetta Tavern',
        neighborhood: 'Greenwich Village',
        cuisine: 'American',
        description: 'The Black Label Burger is the one. Reserve the corner booth.',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_corner_bistro',
        name: 'Corner Bistro',
        neighborhood: 'West Village',
        cuisine: 'American',
        description: 'A New York institution. Cash only, full character, zero pretension.',
        imageUrl:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_burger_joint',
        name: 'Burger Joint',
        neighborhood: 'Midtown',
        cuisine: 'American',
        description: 'Hidden behind the curtain at Le Parker Meridien. Still worth the pilgrimage.',
        imageUrl:
          'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_emily',
        name: 'Emily',
        neighborhood: 'Clinton Hill',
        cuisine: 'American',
        description:
          'The Emmy Burger — smashed, perfectly cheesed, potato bun. Make the trip to Brooklyn.',
        imageUrl:
          'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop',
      },
    ],
    requiredVisits: 4,
    startsAt: '2026-03-01',
    endsAt: '2026-04-15',
    rewardType: 'priority_notify',
    rewardDescription:
      "Priority notify is now active for Raoul's, Don Angie, and Carbone. You'll hear about tables before they go public.",
    editorialTag: 'Spring 2026 · NYC',
  },
  {
    id: 'nyc-rooftop-spring-2026',
    name: 'Rooftop Season',
    theme: 'occasion',
    city: 'nyc',
    description:
      "Spring tables above the city. Dine at 3 of NYC's best rooftop restaurants — places with real food, not just vibes and overpriced rosé.",
    qualifyingVenues: [
      {
        id: 'v_westlight',
        name: 'Westlight',
        neighborhood: 'Williamsburg',
        cuisine: 'American',
        description:
          'William Vale rooftop. Manhattan skyline views, serious cocktails, food that delivers.',
        imageUrl:
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_230fifth',
        name: '230 Fifth',
        neighborhood: 'Flatiron',
        cuisine: 'American',
        description: 'The Empire State Building view never gets old. Come for the skyline, stay for brunch.',
        imageUrl:
          'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_press_lounge',
        name: 'The Press Lounge',
        neighborhood: "Hell's Kitchen",
        cuisine: 'American',
        description: "Ink48 Hotel's rooftop. Hudson River sunsets and a proper bar program.",
        imageUrl:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop',
      },
    ],
    requiredVisits: 3,
    startsAt: '2026-04-01',
    endsAt: '2026-06-30',
    rewardType: 'early_access',
    rewardDescription:
      'Early access to summer rooftop openings — 48-hour advance notice before tables go live.',
    editorialTag: 'Spring 2026 · NYC',
  },
  {
    id: 'nyc-les-locals-2026',
    name: 'Lower East Side Locals',
    theme: 'neighborhood',
    city: 'nyc',
    description:
      'The LES has quietly become one of the most interesting dining neighborhoods in the city. Three restaurants that earn it.',
    qualifyingVenues: [
      {
        id: 'v_contra',
        name: 'Contra',
        neighborhood: 'Lower East Side',
        cuisine: 'Contemporary',
        description: 'The tasting menu that helped define downtown NYC dining.',
        imageUrl:
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_dirt_candy',
        name: 'Dirt Candy',
        neighborhood: 'Lower East Side',
        cuisine: 'Vegetarian',
        description: "Amanda Cohen's vegetable-forward restaurant. You'll leave reconsidering everything.",
        imageUrl:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      },
      {
        id: 'v_forsythia',
        name: 'Forsythia',
        neighborhood: 'Lower East Side',
        cuisine: 'American',
        description: "Neighborhood bistro energy, serious technique. A regular's favorite.",
        imageUrl:
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop',
      },
    ],
    requiredVisits: 3,
    startsAt: '2026-01-15',
    endsAt: '2026-02-28',
    rewardType: 'surprise_perk',
    rewardDescription:
      'A surprise in-restaurant perk waiting at one LES venue — your server will know.',
    editorialTag: 'Winter 2026 · NYC',
  },
];
