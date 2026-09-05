# Graph Report - C:\Users\mashw\Desktop\Priyo SIH  (2026-09-04)

## Corpus Check
- Corpus is ~34,496 words - fits in a single context window. You may not need a graph.

## Summary
- 181 nodes · 204 edges · 22 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 20 edges
2. `cn()` - 15 edges
3. `Badge()` - 12 edges
4. `getDashboardStats()` - 7 edges
5. `Framer Marketing Design System` - 7 edges
6. `middleware()` - 4 edges
7. `signUp()` - 4 edges
8. `ThemeToggle()` - 4 edges
9. `formatDate()` - 4 edges
10. `Next.js Project` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Project` --conceptually_related_to--> `Next.js Wordmark`  [INFERRED]
  priyo-sih/README.md → priyo-sih/public/next.svg
- `Next.js Project` --conceptually_related_to--> `Vercel Mark`  [INFERRED]
  priyo-sih/README.md → priyo-sih/public/vercel.svg
- `middleware()` --calls--> `updateSession()`  [INFERRED]
  src/middleware.ts → src/lib/supabase/middleware.ts
- `handleSubmit()` --calls--> `applyToOpportunity()`  [INFERRED]
  src/app/(portal)/opportunities/[id]/apply-button.tsx → src/actions/applications.ts
- `signUp()` --calls--> `createAdminClient()`  [INFERRED]
  src/actions/auth.ts → src/lib/supabase/server.ts

## Hyperedges (group relationships)
- **Framer Brand System** — design_dark_canvas, design_typography_system, design_accent_blue, design_gradient_spotlight_cards, design_button_primary, design_surface_lift [EXTRACTED 1.00]

## Communities (32 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (8): formatCurrency(), formatDate(), getInitials(), getAvailableMentors(), getMyMentorshipSessions(), getActiveOpportunities(), getOpportunityById(), Badge()

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (8): forgotPassword(), signIn(), signOut(), signUp(), handleSubmit(), onSubmit(), onSubmit(), createAdminClient()

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): AssessmentPage(), getAssessmentWithQuestions(), getAvailableAssessments(), getMyAssessmentResults(), getSkillTaxonomy(), getUserSkills()

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (10): Sky Blue Accent, Primary CTA Pill, Dark Canvas, Framer Marketing Design System, Gradient Spotlight Cards, GT Walsheim Medium, Inter Variable, Responsive Behavior (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.39
Nodes (7): getAcademicianDashboard(), getAdminDashboard(), getDashboardStats(), getIndustryDashboard(), getInstitutionDashboard(), getProfile(), getStudentDashboard()

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (3): applyToOpportunity(), updateApplicationStatus(), handleSubmit()

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (3): RecruiterApplicantsPage(), getAllMyApplicants(), getMyApplications()

### Community 11 - "Community 11"
Cohesion: 0.53
Nodes (4): isAuthRoute(), isPortalRoute(), middleware(), updateSession()

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (5): Next.js Wordmark, Development Server, next/font Geist Integration, Next.js Project, Vercel Mark

## Knowledge Gaps
- **17 isolated node(s):** `Dark Canvas`, `GT Walsheim Medium`, `Inter Variable`, `Sky Blue Accent`, `Gradient Spotlight Cards` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 3` to `Community 0`, `Community 2`, `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 15`?**
  _High betweenness centrality (0.381) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 1` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 0` to `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 15`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `Dark Canvas`, `GT Walsheim Medium`, `Inter Variable` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._