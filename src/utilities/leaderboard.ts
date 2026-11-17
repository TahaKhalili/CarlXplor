// Leaderboard rules: who is on the board, in what order, and how numbers are shown.
// No React in this file, so it is easy to test.

export type LeaderboardEntry = {
  userId: string;
  username: string;
  percent: number; // 0 to 100
  updatedAt: string; // when they reached this percent (ISO string)
  finishedAt?: string | null; // when they reached 100% (ISO string)
  laps?: number; // how many times they have finished the map before
};

export type RankedEntry = LeaderboardEntry & {
  rank: number;
  finished: boolean; // at 100% and still inside their time on top
  hoursLeft: number | null; // hours left on top, only for finishers
};

export type Badge = 'gold' | 'platinum' | null;

// Finishers stay on top for two days, then drop off.
export const HOURS_ON_TOP = 48;

// Switch to false once GET /api/leaderboard exists on the server.
export const USE_SAMPLE_DATA = true;

// Two decimals, rounded down so 99.996 never shows as 100.00.
export function formatPercent(percent: number): string {
  const floored = Math.floor(percent * 100 + 1e-6) / 100;
  return `${floored.toFixed(2)}%`;
}

// null = has not finished. 0 = their time on top is over.
export function getHoursLeft(entry: LeaderboardEntry, now: Date = new Date()): number | null {
  if (!entry.finishedAt) return null;

  const hoursSince = (now.getTime() - new Date(entry.finishedAt).getTime()) / (1000 * 60 * 60);
  const left = HOURS_ON_TOP - hoursSince;
  if (left <= 0) return 0;
  return Math.ceil(left);
}

// 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th", 21 -> "21st"
export function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  if (n % 10 === 1) return `${n}st`;
  if (n % 10 === 2) return `${n}nd`;
  if (n % 10 === 3) return `${n}rd`;
  return `${n}th`;
}

export function getBadge(laps: number | undefined): Badge {
  if (!laps) return null;
  if (laps >= 2) return 'platinum';
  return 'gold';
}

type OnBoard = LeaderboardEntry & { finished: boolean; hoursLeft: number | null };

function compareEntries(a: OnBoard, b: OnBoard): number {
  // Finishers go first, in the order they finished.
  if (a.finished && b.finished) {
    return new Date(a.finishedAt!).getTime() - new Date(b.finishedAt!).getTime();
  }
  if (a.finished) return -1;
  if (b.finished) return 1;

  // Then the higher percent.
  if (a.percent !== b.percent) return b.percent - a.percent;

  // Same percent: whoever got there first is ahead.
  const timeDiff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  if (timeDiff !== 0) return timeDiff;

  return a.userId.localeCompare(b.userId);
}

export function rankEntries(entries: LeaderboardEntry[], now: Date = new Date()): RankedEntry[] {
  const onBoard: OnBoard[] = [];

  for (const entry of entries) {
    const hoursLeft = getHoursLeft(entry, now);
    if (hoursLeft === 0) continue; // their 48 hours are over, so they are off the board
    onBoard.push({ ...entry, finished: hoursLeft !== null, hoursLeft });
  }

  onBoard.sort(compareEntries);

  return onBoard.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// Made-up players so the screen works before the server route exists.
// livePercent is how much of campus you have really explored; without it you are at 50.20%.
export function getSampleEntries(
  currentUserId: string,
  now: Date = new Date(),
  livePercent?: number,
): LeaderboardEntry[] {
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  return [
    { userId: 'u01', username: 'arbwalker', percent: 100, updatedAt: hoursAgo(39), finishedAt: hoursAgo(39) },
    { userId: 'u02', username: 'schiller_bust', percent: 100, updatedAt: hoursAgo(10), finishedAt: hoursAgo(10) },
    { userId: 'u03', username: 'lymanlakes', percent: 93.4, updatedAt: hoursAgo(3) },
    { userId: 'u04', username: 'goodhue_ghost', percent: 91.02, updatedAt: hoursAgo(5), laps: 1 },
    { userId: 'u05', username: 'weitz_wanderer', percent: 88.75, updatedAt: hoursAgo(20) },
    { userId: 'u06', username: 'bald_spot', percent: 84.1, updatedAt: hoursAgo(8) },
    { userId: 'u07', username: 'knightwatch', percent: 81.66, updatedAt: hoursAgo(30) },
    { userId: 'u08', username: 'dacie_cookies', percent: 81.66, updatedAt: hoursAgo(12) },
    { userId: 'u09', username: 'sayles_regular', percent: 79.3, updatedAt: hoursAgo(2), laps: 2 },
    { userId: 'u10', username: 'rotblatt_ump', percent: 77.85, updatedAt: hoursAgo(26) },
    { userId: 'u11', username: 'cowling_crow', percent: 75.1, updatedAt: hoursAgo(7) },
    { userId: 'u12', username: 'willis_bell', percent: 74.63, updatedAt: hoursAgo(15) },
    { userId: 'u13', username: 'cave_dweller', percent: 71.08, updatedAt: hoursAgo(4) },
    { userId: 'u14', username: 'olin_owl', percent: 50.21, updatedAt: hoursAgo(6), laps: 2 },
    { userId: currentUserId, username: 'fog_lifter', percent: livePercent ?? 50.2, updatedAt: hoursAgo(1) },
    { userId: 'u16', username: 'musser_mayor', percent: 50.12, updatedAt: hoursAgo(9) },
  ];
}