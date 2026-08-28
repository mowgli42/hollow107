Feature: Role-gated resolution
  FSR fills, engineer hypothesizes, QA stamps.

  @validated
  Scenario: Solid case can close through engineer and QA
    Given the teaching fixture solid-cold-soak.xml
    Then an engineer may start resolution
    And an engineer may submit for QA
    And QA may close
    And an engineer may not close

  @validated
  Scenario: Engineer is blocked on a hollow case
    Given the ghost 107
    Then an engineer cannot move it to in-resolution
    And QA cannot close it

  @validated
  Scenario: FSR cannot skip the completeness gate; QA may override
    Given the ghost 107
    Then FSR cannot send it to the engineer
    And QA can send it to the engineer

  @future
  Scenario: Hypotheses are matched against Brain Book signatures
    Given a solid 107 with a GPS-1 cold-soak log
    When the engineer starts resolution
    Then candidate signatures from the Brain Book are listed
    And each signature names the kill-check that would refute it
