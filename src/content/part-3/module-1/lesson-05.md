---
id: part-3-module-1-lesson-05
title: Choosing the right reference class
part: 3
module: 1
lesson_number: 5
lesson_type: exercise
estimated_minutes: 3
gate_required: true
order_index: 52
prompt: 'A person is estimating how long it will take to write and submit a grant application for a community project.'
attempts_allowed: -1
exercise:
  kind: multiple-choice
  mode: multi
  question: 'Which two reference classes are most appropriate?'
  options:
    - id: all-grants
      label: All grant applications ever submitted anywhere
      explanation: "Too broad. This reference class is so large and varied that the distribution of outcomes won't be meaningfully comparable to this specific type of application."
    - id: this-funder
      label: Grant applications submitted to this specific funding body for community projects in the past five years
      explanation: 'Appropriate. Large enough for statistical patterns, specific enough to be comparable — same funder, same project type, recent timeframe.'
    - id: last-two
      label: The last two grant applications this same person submitted to any funder
      explanation: "Too narrow. Two cases aren't enough to form a reliable distribution. A streak of fast completions or slow completions in two applications could reflect almost anything."
    - id: similar-orgs
      label: Applications submitted by similar organizations in this region over the past 12 months
      explanation: 'Appropriate. A reasonable sample size, similar organizational profile, and recent — giving a distribution that the current situation can be placed within.'
  correct_option_ids:
    - this-funder
    - similar-orgs
---
