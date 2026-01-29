# Phase 1: Core Mechanics - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can start a debate with motion input and see AI agents follow CPDL rules - implementing motion handling, CPDL format enforcement, timing controls, and AI agent behaviors. This establishes the foundational debate mechanics including motion input, role-specific rules enforcement, and AI agent behaviors.

</domain>

<decisions>
## Implementation Decisions

### Motion handling
- Basic format validation checking for 'This House believes that' prefix
- Motion stored in localStorage during debate session
- Motion included in conversation history passed to AI agents
- No templates or suggestions - only free-form custom input allowed

### AI agent rules
- Role-specific rules enforced through prompt engineering in each AI request
- LO role includes explicit instruction that it must challenge PM definition
- MO/PW roles use content filtering to prevent new argument introduction
- Each AI agent has distinct personality traits appropriate to their role

### Claude's Discretion
- Specific prompt engineering techniques for rule enforcement
- Technical implementation of localStorage persistence
- UI elements for motion input and validation feedback

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-core-mechanics*
*Context gathered: 2026-01-29*