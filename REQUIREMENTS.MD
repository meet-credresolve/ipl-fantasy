# Project Requirements: Private IPL 2026 Fantasy League App

## 1. App Overview & Scope
The application is a private, invite-only fantasy cricket platform tailored specifically for the **IPL 2026 season**. It allows a closed circle of friends to compete against each other using a fantasy model heavily inspired by Dream11. There are no public contests or real-money gambling mechanics involving payment gateways; the focus is on a season-long overarching leaderboard and individual match bragging rights.

---

## 2. Team Creation Mechanics (The Fantasy Model)
Users must build a virtual team of real-life players for every scheduled IPL 2026 match.

### 2.1 Budget & Squad Size
* **Virtual Budget:** Each user gets exactly 100 Credits to build their team.
* **Squad Size:** A valid team must consist of exactly 11 players.
* **Team Constraint:** A maximum of 7 players can be selected from a single IPL franchise in any given match.

### 2.2 Player Categories & Limits
To ensure balanced team creation, users must select players within the following limits:
* **Wicket-Keepers (WK):** 1 to 4 players
* **Batters (BAT):** 3 to 6 players
* **All-Rounders (AR):** 1 to 4 players
* **Bowlers (BOWL):** 3 to 6 players

### 2.3 Role Multipliers
Users must designate two key players in their starting 11 who receive point multipliers based on their real-life match performance:
* **Captain (C):** Scores 2x the points earned.
* **Vice-Captain (VC):** Scores 1.5x the points earned.

---

## 3. The Scoring System
The app will use a standardized fantasy cricket point system. Points are awarded based on official IPL match data.

### 3.1 Batting Points
* **Base Run:** +1 point per run scored.
* **Boundary Bonus:** +1 point per boundary (Four).
* **Six Bonus:** +2 points per Six hit.
* **Milestone Bonuses:**
    * Half-Century (50 runs): +8 points
    * Century (100 runs): +16 points
* **Duck Penalty:** -2 points (Applies only to recognized Batters, Wicket-Keepers, and All-Rounders who get out for 0 runs. Does not apply to pure Bowlers).

### 3.2 Bowling Points
* **Wicket:** +25 points (Excludes run-outs).
* **Bonus Wickets (LBW / Bowled):** +8 points per wicket.
* **Milestone Bonuses:**
    * 4-Wicket Haul: +8 points
    * 5-Wicket Haul: +16 points
* **Maiden Over:** +12 points.

### 3.3 Fielding Points
* **Catch:** +8 points.
* **Bonus Catch:** +4 points (For taking 3 or more catches in a single match).
* **Stumping:** +12 points.
* **Run Out (Direct Hit):** +12 points.
* **Run Out (Not a Direct Hit):** +6 points each to the thrower and the catcher.

### 3.4 Economy & Strike Rate Modifiers
*(Applied only if the player meets minimum thresholds: Batters must face at least 10 balls; Bowlers must bowl at least 2 overs).*
* **Batting Strike Rate (Runs per 100 balls):**
    * Above 170: +6 points
    * 150.01 to 170: +4 points
    * 130 to 150: +2 points
    * 60 to 70: -2 points
    * 50 to 59.99: -4 points
    * Below 50: -6 points
* **Bowling Economy Rate (Runs per over):**
    * Below 5 runs/over: +6 points
    * 5 to 5.99 runs/over: +4 points
    * 6 to 7 runs/over: +2 points
    * 10 to 11 runs/over: -2 points
    * 11.01 to 12 runs/over: -4 points
    * Above 12 runs/over: -6 points

---

## 4. Match Lifecycle & User Flow

### 4.1 Pre-Match (Drafting Phase)
* Matches are listed chronologically based on the IPL 2026 schedule.
* Users can create and edit their teams days in advance.
* **Lineup Announcements:** Once the real-life toss occurs and playing XIs are announced, the app must clearly mark players as "Playing" or "Not Playing" (usually a green/red dot indicator).
* **Deadline:** Team editing locks exactly when the first ball is bowled. No modifications can be made after this timestamp.

### 4.2 Live Match (In-Play Phase)
* **Live Leaderboard:** A match-specific leaderboard that updates dynamically as real-life events happen.
* **Player Fantasy Scorecards:** Users can tap on any opposing friend's team to see exactly which players are scoring points and how.

### 4.3 Post-Match (Review Phase)
* Matches move to a "Completed" state.
* Final points are tallied, and the match leaderboard is locked.
* Points from the individual match are rolled up into the **Season Overall Leaderboard**.

---

## 5. Private League & Social Features
Since this is for a closed circle of friends, specific community features are required:

* **Invite-Only Group:** The app will have a single "League" or "Group" created by the Admin. Users join via a unique invite code/link.
* **Dual Leaderboards:**
    * *Match Leaderboard:* Ranks friends based solely on the current/latest match.
    * *IPL 2026 Overall Leaderboard:* An aggregated leaderboard tracking total fantasy points accumulated across the entire IPL season.
* **Group Banter Board (Optional but Recommended):** A simple chat thread or comment section on the match page where friends can trash-talk and discuss the live match.

---

## 6. Admin & Data Management (Functional View)
* **Player Pricing:** The system must assign and store credit values for all IPL 2026 players based on their real-world stature (e.g., Virat Kohli = 10.0 credits, an uncapped rookie = 5.5 credits). The Admin must be able to adjust these before the tournament starts.
* **Points Calculation Engine:** The app must ingest live match data (runs, wickets, overs) and map it against the rules outlined in Section 3 to output fantasy points for every user.
* **Cancellation/Abandonment Rule:** If a real-life IPL match is abandoned or washed out without a result, the fantasy match is voided, and no points are added to the Overall Season Leaderboard.