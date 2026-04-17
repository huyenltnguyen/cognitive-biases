---
id: part-2-module-3-lesson-04
title: Loss aversion or legitimate caution?
part: 2
module: 3
lesson_number: 4
lesson_type: exercise
estimated_minutes: 3
gate_required: true
order_index: 31
prompt: 'There are five scenarios. Sort each into the category that best explains the decision.'
attempts_allowed: -1
exercise:
  kind: drag-drop
  items:
    - id: scenario-a
      label: "A team has identified a better supplier with lower pricing and higher quality ratings. They stay with the current supplier anyway, because 'switching would damage the relationship we've built.'"
    - id: scenario-b
      label: 'A person decides not to invest their savings in a highly speculative asset because the potential loss would seriously harm their financial security.'
    - id: scenario-c
      label: 'A committee continues using a process they know is inefficient, because changing it would require a difficult transition period.'
    - id: scenario-d
      label: 'A team postpones launching a new initiative because the research phase is not yet complete.'
    - id: scenario-e
      label: "An organization keeps a recurring annual event on the calendar despite consistently low attendance, because canceling it 'would send the wrong message.'"
  targets:
    - id: loss-aversion
      label: Loss aversion
      accepts_item_ids:
        - scenario-a
        - scenario-c
        - scenario-e
    - id: legitimate
      label: Legitimate caution or delay
      accepts_item_ids:
        - scenario-b
        - scenario-d
---
