export interface EarnedMilestone {
  id: string;
  earnedAt: string;
}

export interface InProgressMilestone {
  id: string;
  progress: number;
  target: number;
}

export interface ChallengeProgress {
  state: 'active' | 'upcoming' | 'completed' | 'expired';
  visitedVenueIds: string[];
}

export interface MilestonesState {
  earned: EarnedMilestone[];
  inProgress: InProgressMilestone[];
  cuisinesExplored: number;
  neighborhoodsVisited: number;
  isRegularSomewhere: boolean;
}

export interface BookingRecord {
  venueId: string;
  venueName: string;
  neighborhood: string;
  cuisine: string;
  date: string;
  partySize: number;
  status: 'completed' | 'reserved';
}

export interface SeedState {
  user: {
    id: string;
    name: string;
    city: string;
    memberSince: string;
    totalBookings: number;
  };
  bookingHistory: BookingRecord[];
  challengeProgress: Record<string, ChallengeProgress>;
  milestones: MilestonesState;
}

export const seedState: SeedState = {
  user: {
    id: 'usr_tj_demo',
    name: 'TJ',
    city: 'nyc',
    memberSince: '2022-03-01',
    totalBookings: 47,
  },
  bookingHistory: [
    { venueId: 'v_emilio', venueName: "Emilio's Ballato", neighborhood: 'SoHo', cuisine: 'italian', date: '2026-02-14', partySize: 2, status: 'completed' },
    { venueId: 'v_minetta', venueName: 'Minetta Tavern', neighborhood: 'Greenwich Village', cuisine: 'american', date: '2026-03-10', partySize: 2, status: 'completed' },
    { venueId: 'v_corner_bistro', venueName: 'Corner Bistro', neighborhood: 'West Village', cuisine: 'american', date: '2026-03-18', partySize: 2, status: 'completed' },
    // LES Locals (completed challenge)
    { venueId: 'v_contra', venueName: 'Contra', neighborhood: 'Lower East Side', cuisine: 'contemporary', date: '2026-01-20', partySize: 2, status: 'completed' },
    { venueId: 'v_dirt_candy', venueName: 'Dirt Candy', neighborhood: 'Lower East Side', cuisine: 'vegetarian', date: '2026-02-05', partySize: 2, status: 'completed' },
    { venueId: 'v_forsythia', venueName: 'Forsythia', neighborhood: 'Lower East Side', cuisine: 'american', date: '2026-02-20', partySize: 2, status: 'completed' },
    // Noodle Chaser (5 ramen bookings)
    { venueId: 'v_ippudo', venueName: 'Ippudo NY', neighborhood: 'East Village', cuisine: 'ramen', date: '2026-01-10', partySize: 2, status: 'completed' },
    { venueId: 'v_totto', venueName: 'Totto Ramen', neighborhood: "Hell's Kitchen", cuisine: 'ramen', date: '2026-01-25', partySize: 1, status: 'completed' },
    { venueId: 'v_nakamura', venueName: 'Nakamura', neighborhood: 'Lower East Side', cuisine: 'ramen', date: '2026-02-08', partySize: 2, status: 'completed' },
    { venueId: 'v_mu_ramen', venueName: 'Mu Ramen', neighborhood: 'Long Island City', cuisine: 'ramen', date: '2026-02-22', partySize: 2, status: 'completed' },
    { venueId: 'v_ichiran', venueName: 'Ichiran', neighborhood: 'Midtown', cuisine: 'ramen', date: '2026-03-05', partySize: 1, status: 'completed' },
    // West Village Regular (4+ same neighborhood)
    { venueId: 'v_via_carota', venueName: 'Via Carota', neighborhood: 'West Village', cuisine: 'italian', date: '2025-11-15', partySize: 2, status: 'completed' },
    { venueId: 'v_buvette', venueName: 'Buvette', neighborhood: 'West Village', cuisine: 'french', date: '2025-12-08', partySize: 2, status: 'completed' },
    { venueId: 'v_cornelia', venueName: 'Cornelia Street Cafe', neighborhood: 'West Village', cuisine: 'american', date: '2026-01-18', partySize: 2, status: 'completed' },
    // Table for Two, Always (10 consecutive 2-tops)
    { venueId: 'v_don_angie', venueName: 'Don Angie', neighborhood: 'West Village', cuisine: 'italian', date: '2025-10-20', partySize: 2, status: 'completed' },
    { venueId: 'v_raouls', venueName: "Raoul's", neighborhood: 'SoHo', cuisine: 'french', date: '2025-11-03', partySize: 2, status: 'completed' },
    { venueId: 'v_estela', venueName: 'Estela', neighborhood: 'NoHo', cuisine: 'mediterranean', date: '2025-11-28', partySize: 2, status: 'completed' },
    { venueId: 'v_satsuki', venueName: 'Satsuki', neighborhood: 'Midtown', cuisine: 'japanese', date: '2026-01-05', partySize: 2, status: 'completed' },
    { venueId: 'v_aska', venueName: 'Aska', neighborhood: 'Williamsburg', cuisine: 'nordic', date: '2026-02-12', partySize: 2, status: 'completed' },
    // Taco Cartographer (3/5 progress)
    { venueId: 'v_tacos_el_bronco', venueName: 'Tacos El Bronco', neighborhood: 'Sunset Park', cuisine: 'mexican', date: '2025-12-15', partySize: 2, status: 'completed' },
    { venueId: 'v_los_tacos', venueName: 'Los Tacos No. 1', neighborhood: 'Chelsea', cuisine: 'mexican', date: '2026-01-30', partySize: 2, status: 'completed' },
    { venueId: 'v_oxomoco', venueName: 'Oxomoco', neighborhood: 'Greenpoint', cuisine: 'mexican', date: '2026-02-28', partySize: 2, status: 'completed' },
  ],
  challengeProgress: {
    'nyc-burger-2026-q2': {
      state: 'active',
      visitedVenueIds: ['v_minetta', 'v_corner_bistro'],
    },
    'nyc-rooftop-spring-2026': {
      state: 'upcoming',
      visitedVenueIds: [],
    },
    'nyc-les-locals-2026': {
      state: 'completed',
      visitedVenueIds: ['v_contra', 'v_dirt_candy', 'v_forsythia'],
    },
  },
  milestones: {
    earned: [
      { id: 'noodle-chaser', earnedAt: '2026-03-05' },
      { id: 'west-village-regular', earnedAt: '2026-02-15' },
      { id: 'table-for-two', earnedAt: '2026-01-28' },
    ],
    inProgress: [
      { id: 'taco-cartographer', progress: 3, target: 5 },
      { id: 'borough-crosser', progress: 3, target: 4 },
    ],
    cuisinesExplored: 7,
    neighborhoodsVisited: 5,
    isRegularSomewhere: true,
  },
};
