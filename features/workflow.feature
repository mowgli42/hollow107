Feature: Case workflow moves by role
  State transitions live in the case header. Each role sees forward and backward
  moves allowed for the current status, plus step-by-step guidance.

  Background:
    Given a signed-in viewer with role FSR, Engineer, or QA

  @validated
  Scenario: FSR triages a fresh import
    Given a solid 107 in status ingested
    When the FSR views the case
    Then the step bar shows Triage as current
    And last update appears as plain text above the title
    And the Request tab is selected by default
    And FSR guidance says to confirm unit, POC, description, mission impact, and log disposition
    And FSR may move forward to ready-for-engineer
    And FSR may move forward to awaiting-context when gaps remain

  @validated
  Scenario: FSR sends a hollow case back for context
    Given the ghost 107 in status ingested
    When the FSR views the case
    Then FSR cannot move forward to ready-for-engineer
    And FSR may move forward to awaiting-context
    And FSR fills triage fields until hollowness is 20% or below

  @validated
  Scenario: FSR pulls a case back from engineering
    Given a solid 107 in status ready-for-engineer
    When the FSR views the case
    Then FSR may move backward to awaiting-context

  @validated
  Scenario: Engineer starts and submits resolution
    Given a solid 107 in status ready-for-engineer
    When the Engineer views the case
    Then Engineer guidance says to review the TAR and start resolution
    And Engineer may move forward to in-resolution
    When the case is in-resolution
    Then Engineer may add hypotheses with kill-checks and notes
    And Engineer may move forward to qa-review
    And Engineer may move backward to ready-for-engineer

  @validated
  Scenario: QA reviews, closes, rejects, or sends back
    Given a solid 107 in status qa-review
    When QA views the case
    Then QA guidance says to review notes and hypotheses
    And QA may move forward to closed when hollowness is 20% or below
    And QA may move forward to rejected
    And QA may move backward to ready-for-engineer

  @validated
  Scenario: QA resumes engineer work from review
    Given a solid 107 in status qa-review
    When the Engineer views the case
    Then Engineer may move forward to in-resolution

  @future
  Scenario: Terminal cases show audit guidance only
    Given a closed or rejected 107
    When any role views the case
    Then no forward or backward move buttons appear
    And guidance says to review the envelope for the audit trail
