---
id: part-2-module-2-lesson-07
title: Base rate or specific detail?
part: 2
module: 2
lesson_number: 7
lesson_type: exercise
estimated_minutes: 3
gate_required: true
order_index: 25
prompt: "Sort five pieces of information about a home renovation into base rates and specific details."
attempts_allowed: -1
exercise:
  kind: drag-drop
  instructions: "A person is planning a major home renovation. Drag each piece of information into Base rate or Specific detail."
  items:
    - id: contractor-track
      label: "My contractor has done three similar renovations and all came in on time."
    - id: survey-stat
      label: "According to a large consumer survey, 68% of home renovations take longer than the original estimate."
    - id: structural
      label: "My renovation involves structural work that my contractor says they've handled before."
    - id: cost-overrun
      label: "The average cost overrun for home renovations of this size is 22%."
    - id: house-age
      label: "The house was built in the 1960s, and my contractor flagged that older construction can reveal surprises once walls are opened."
  targets:
    - id: base-rate
      label: Base rate
      accepts_item_ids:
        - survey-stat
        - cost-overrun
    - id: specific
      label: Specific detail
      accepts_item_ids:
        - contractor-track
        - structural
        - house-age
---


