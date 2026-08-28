Feature: Unanswered time and criticality
  Waiting work is visible without opening the case.

  @validated
  Scenario: Emergency ghost older than 4 hours is critical
    Given the teaching fixture ghost-box-failed.xml submitted 2026-08-12
    When the queue is rendered on 2026-08-28
    Then criticality is critical
    And the wait chip starts with Unanswered

  @validated
  Scenario: Status strip reports last import
    Given a successful ingest
    Then the status strip is not idle-only toast
    And it includes the ingest summary

  @future
  Scenario: SLA calendar per MDS
    Given an emergency 107 against a jet on the schedule
    Then criticality uses the MDS SLA, not a flat 4 hours
