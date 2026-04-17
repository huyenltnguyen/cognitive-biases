---
id: part-2-module-1-lesson-04
title: Match the stage
part: 2
module: 1
lesson_number: 4
lesson_type: exercise
estimated_minutes: 4
gate_required: true
order_index: 12
prompt: 'Eight things the buyer does or notices are listed below. Sort each into the stage of confirmation bias it represents.'
attempts_allowed: -1
exercise:
  kind: drag-drop
  instructions: 'Drag each item to the correct stage.'
  success_feedback: 'Each of these moments is unremarkable on its own. Together they show how confirmation bias runs through the entire reasoning process — not just one step.'
  items:
    - id: search-1
      label: 'Searches for reviews asking whether this model is worth buying.'
    - id: interpretation-1
      label: 'Reads the price as good timing.'
    - id: noticing-1
      label: 'Spends time on the warranty section; scrolls past the independent reviews.'
    - id: memory-1
      label: 'Recalls the dent as barely noticeable.'
    - id: interpretation-2
      label: 'Reads the dent as cosmetic.'
    - id: search-2
      label: 'Asks a friend who bought the same model whether they have been happy with it.'
    - id: memory-2
      label: 'When recommending the laptop to a colleague, mentions the warranty and benchmark result; the battery reviews and low rating count do not come up.'
    - id: noticing-2
      label: 'Glances at the independent reviews and moves on to message the seller.'
  targets:
    - id: search
      label: 'Search — what the buyer looks for'
      accepts_item_ids:
        - search-1
        - search-2
    - id: noticing
      label: 'Noticing — what registers versus fades'
      accepts_item_ids:
        - noticing-1
        - noticing-2
    - id: interpretation
      label: 'Interpretation — how the buyer reads ambiguous information'
      accepts_item_ids:
        - interpretation-1
        - interpretation-2
    - id: memory
      label: 'Memory — what the buyer retains and recalls'
      accepts_item_ids:
        - memory-1
        - memory-2
---

A buyer researches a refurbished laptop listing. The listing includes a six-month warranty and photos showing a noticeable dent on the corner. The seller responds quickly and is easy to communicate with, but has fewer than five platform ratings. A remote benchmark confirms normal performance. Independent reviews note occasional battery-health problems for this model. The price is noticeably below comparable listings.
