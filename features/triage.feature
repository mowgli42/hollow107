Feature: Hollowness triage
  Five required fields drive completeness before diagnosis.

  @validated
  Scenario: Slogan descriptions are still a gap
    Given a 107 whose description is "Box failed. Please advise ASAP."
    When gaps are computed
    Then description is among the gaps

  @validated
  Scenario: Thin 107 only lacks log disposition
    Given the teaching fixture thin-nav-align.xml
    When the XML is ingested
    Then gaps include evidence
    And status is ingested until FSR triages

  @validated
  Scenario: Filling the ghost drops hollowness to solid
    Given the ghost 107
    When unit, POC, description, mission impact, and log disposition are supplied
    Then gaps are empty
    And hollowness is 0

  @validated
  Scenario: Missing log reason or N/A clears the evidence gap
    Given the ghost 107
    When noLogReason is supplied or marked N/A
    Then evidence is no longer a gap

  @future
  Scenario: Nemotron writes the callback in the unit's voice
    Given a thin 107
    When callback questions are generated
    Then the prose is grounded only in missing fields
    And the model refuses to diagnose
