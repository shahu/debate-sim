# Phase 5: Judge Commentary - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Post-debate scoring and detailed feedback system that provides numerical scores for each participant, judge-like narrative commentary explaining strengths and weaknesses, detailed breakdown by evaluation criteria (content, rebuttal, POI handling, delivery, teamwork), and comparative analysis highlighting differences between speakers' performances.

</domain>

<decisions>
## Implementation Decisions

### Scoring methodology
- Percentage (0-100%) scale for all numerical scores
- Equal weighting for all five evaluation criteria
- Overall score calculated as average of all criteria plus judge's holistic adjustment
- All scores (overall and individual criteria) shown as percentages

### Feedback presentation
- Side-by-side panels layout for all four speakers
- Content organized with scores first, followed by detailed commentary
- Progress bars used to show percentage scores visually
- Prominent banner for overall verdict or winner declaration

### Evaluation criteria detail
- Each main criterion has 2-3 sub-criteria for moderate detail
- Only the 5 main criteria receive individual scores; sub-criteria are descriptive
- Teamwork evaluated as individual contribution for each speaker
- Include specific examples and explanations for each criterion

### Comparison approach
- Direct comparison statements in side-by-side layout (e.g., "PM outperformed LO in content")
- Full ranking of all 4 speakers from 1st to 4th place
- Allow ties when scores are very close (e.g., "1st (tie)")
- Include specific moments and quotes from the debate in comparative analysis

### Claude's Discretion
- Exact progress bar styling and implementation
- Specific tie-breaking threshold for determining "very close" scores
- Layout responsiveness and mobile adaptation
- Error handling for edge cases in scoring

</decisions>

<specifics>
## Specific Ideas

- "Side-by-side panels should make it easy to compare speakers at a glance"
- "Progress bars should be visually clear and match the existing UI style"
- "Include actual debate quotes to make feedback more concrete and actionable"
- "Winner declaration should be prominent but not overwhelming"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-judge-commentary*
*Context gathered: 2026-01-30*