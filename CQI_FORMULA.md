# Code Quality Index (CQI) Formula

The CQI is a composite metric designed to rank users on the leaderboard based on their competitive programming activity across multiple platforms (Codeforces, LeetCode, AtCoder).

## Core Philosophy
The index rewards three main dimensions:
1. **Volume/Experience (V)**: The sheer number of accepted submissions, weighted by problem difficulty (when available via APIs).
2. **Consistency (C)**: Regular practice. Submissions within the last 30 days are weighted higher to encourage active learning.
3. **Contest Performance (R)**: Real rating changes from official contests.

## The Formula

`CQI = (V * 0.4) + (C * 0.3) + (R * 0.3)`

### 1. Volume (V)
`V = sum(base_points * difficulty_multiplier)`
- LeetCode Easy: 10 pts
- LeetCode Medium: 20 pts
- LeetCode Hard: 40 pts
- Codeforces (Div 2 A): 10 pts
- Codeforces (Div 2 C+): 30 pts

*(Note: In the V1 prototype, `V = total_AC_submissions * 10` until difficulty scraping is fully robust).*

### 2. Consistency (C)
Calculated based on the user's activity heatmap.
- `C = (active_days_in_last_30 / 30) * 1000`

### 3. Contest Rating (R)
`R = (Max_CF_Rating * 0.5) + (Max_LC_Rating * 0.5)`
If a user only has one linked platform, it accounts for 100% of the rating weight. Positive rating deltas in recent contests grant a bonus multiplier of `1.05x` to this category.
