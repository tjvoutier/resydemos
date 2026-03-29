export type MilestoneDimension = 'exploration' | 'palate' | 'loyalty' | 'patterns';

export interface Milestone {
  id: string;
  name: string;
  emoji: string;
  dimension: MilestoneDimension;
  triggerDescription: string;
  progressHint: string;
  lockedHint: string;
}

export const milestoneCatalog: Milestone[] = [
  // Exploration
  {
    id: 'west-village-regular',
    name: 'West Village Regular',
    emoji: '🏙️',
    dimension: 'exploration',
    triggerDescription: '4+ visits in the same neighborhood',
    progressHint: 'Keep visiting your favorite neighborhood',
    lockedHint: 'Become a regular somewhere',
  },
  {
    id: 'borough-crosser',
    name: 'Borough Crosser',
    emoji: '🗺️',
    dimension: 'exploration',
    triggerDescription: 'Bookings in 4 of 5 NYC boroughs',
    progressHint: '1 more borough to unlock',
    lockedHint: 'Range across all five boroughs',
  },
  {
    id: 'new-block-new-table',
    name: 'New Block, New Table',
    emoji: '🧭',
    dimension: 'exploration',
    triggerDescription: 'First booking in a neighborhood never previously visited',
    progressHint: 'Try somewhere new',
    lockedHint: 'Venture into new territory',
  },
  {
    id: 'the-commuter',
    name: 'The Commuter',
    emoji: '🚇',
    dimension: 'exploration',
    triggerDescription: '3+ bookings more than 2 miles from your home neighborhood',
    progressHint: 'Book somewhere farther from home',
    lockedHint: 'Go out of your way for a great meal',
  },

  // Palate
  {
    id: 'noodle-chaser',
    name: 'Noodle Chaser',
    emoji: '🍜',
    dimension: 'palate',
    triggerDescription: '5 ramen or noodle bookings',
    progressHint: 'A few more bowls to go',
    lockedHint: 'Follow the noodles',
  },
  {
    id: 'omakase-devotee',
    name: 'The Omakase Devotee',
    emoji: '🍣',
    dimension: 'palate',
    triggerDescription: "3+ omakase or chef's counter bookings",
    progressHint: '1 more counter seat to unlock',
    lockedHint: 'Trust the chef',
  },
  {
    id: 'taco-cartographer',
    name: 'Taco Cartographer',
    emoji: '🌮',
    dimension: 'palate',
    triggerDescription: '5 taqueria bookings across multiple neighborhoods',
    progressHint: '2 more taquerias to unlock',
    lockedHint: 'Map out the best tacos in the city',
  },
  {
    id: 'seven-cuisines',
    name: 'Seven Cuisines',
    emoji: '🌍',
    dimension: 'palate',
    triggerDescription: 'Bookings across 7 distinct cuisine types in 6 months',
    progressHint: 'Explore a new cuisine type',
    lockedHint: 'Broaden your palate',
  },
  {
    id: 'the-italian',
    name: 'The Italian',
    emoji: '🍝',
    dimension: 'palate',
    triggerDescription: '6+ Italian restaurant bookings in 12 months',
    progressHint: 'Keep ordering the pasta',
    lockedHint: 'Dedicate yourself to a cuisine',
  },

  // Loyalty
  {
    id: 'the-regular',
    name: 'The Regular',
    emoji: '🪑',
    dimension: 'loyalty',
    triggerDescription: '5+ visits to the same restaurant',
    progressHint: 'Almost a regular',
    lockedHint: 'Find your place',
  },
  {
    id: 'table-for-two',
    name: 'Table for Two, Always',
    emoji: '🕯️',
    dimension: 'loyalty',
    triggerDescription: '10 consecutive 2-top bookings',
    progressHint: 'Keep dining for two',
    lockedHint: 'Some patterns are worth noticing',
  },
  {
    id: 'sunday-ritual',
    name: 'Sunday Ritual',
    emoji: '☕',
    dimension: 'loyalty',
    triggerDescription: '4+ Sunday dinner bookings at the same restaurant',
    progressHint: 'Sunday belongs to this spot',
    lockedHint: 'Rituals are earned, not scheduled',
  },
  {
    id: 'anniversary-table',
    name: 'Anniversary Table',
    emoji: '🥂',
    dimension: 'loyalty',
    triggerDescription: 'Same restaurant, same time of year, two years running',
    progressHint: 'Return next year',
    lockedHint: 'Some restaurants are worth returning to',
  },

  // Patterns
  {
    id: 'opening-night',
    name: 'Opening Night',
    emoji: '✨',
    dimension: 'patterns',
    triggerDescription: "Booked a restaurant within 14 days of its Resy debut",
    progressHint: 'Watch for new openings',
    lockedHint: 'Get there first',
  },
  {
    id: 'the-adventurer',
    name: 'The Adventurer',
    emoji: '🔍',
    dimension: 'patterns',
    triggerDescription: '3+ bookings at restaurants with fewer reviews on Resy',
    progressHint: 'Keep finding hidden gems',
    lockedHint: "Go where others haven't",
  },
  {
    id: 'midweek-regular',
    name: 'Midweek Regular',
    emoji: '📅',
    dimension: 'patterns',
    triggerDescription: '8+ Tuesday or Wednesday bookings in 6 months',
    progressHint: "You're onto something here",
    lockedHint: 'The best seats are mid-week',
  },
  {
    id: 'last-minute',
    name: 'Last-Minute Lisa',
    emoji: '⚡',
    dimension: 'patterns',
    triggerDescription: '5+ bookings made less than 4 hours ahead',
    progressHint: 'Keep living spontaneously',
    lockedHint: 'Some diners plan. Others improvise.',
  },
  {
    id: 'the-planner',
    name: 'The Planner',
    emoji: '📋',
    dimension: 'patterns',
    triggerDescription: '5+ bookings made 14+ days in advance',
    progressHint: 'Securing that table ahead of time',
    lockedHint: 'The reservation is half the excitement',
  },
  {
    id: 'solo-diner',
    name: 'Solo Diner',
    emoji: '🎭',
    dimension: 'patterns',
    triggerDescription: '5+ solo bookings',
    progressHint: 'A few more solo meals to go',
    lockedHint: 'Dining alone is an art',
  },
];
