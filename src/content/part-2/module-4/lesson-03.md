---
id: part-2-module-4-lesson-03
title: Independent or conforming?
part: 2
module: 4
lesson_number: 3
lesson_type: exercise
estimated_minutes: 3
gate_required: true
order_index: 40
prompt: 'A hiring panel is debating whether to advance a candidate to the final round.'
attempts_allowed: -1
exercise:
  kind: matching
  instructions: 'Classify each contribution as independent judgment or conforming to the emerging group position.'
  left_items:
    - id: lead
      label: 'Panel lead: "I think we should advance this candidate — their project experience stands out and they interviewed well."'
    - id: member-a
      label: 'Member A: "I agree on the project experience. I do think their technical answers were weaker than the other finalist''s, though."'
    - id: member-b-first
      label: 'Member B: "I had the same concern about the technical answers, but if the lead thinks the project experience outweighs that, I''ll defer."'
    - id: member-c-first
      label: 'Member C: "I wasn''t sure about advancing them, but it sounds like most of you see something I might be missing."'
    - id: member-d
      label: 'Member D: "Before we decide, can we compare their technical scores side by side with the other finalist?"'
  right_items:
    - id: independent
      label: Independent judgment
    - id: conforming
      label: Conforming to the group
  correct_pairs:
    - left_id: lead
      right_id: independent
    - left_id: member-a
      right_id: independent
    - left_id: member-b-first
      right_id: conforming
    - left_id: member-c-first
      right_id: conforming
    - left_id: member-d
      right_id: independent
  success_feedback: 'Member B defers to the lead''s authority despite having a genuine concern. Member C reinterprets their own doubt as ignorance rather than a valid perspective. Both conform, but for different reasons.'
---
