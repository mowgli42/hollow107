Feature: Hollowness triage
  Completeness is scored before diagnosis.

  @validated
  Scenario: Slogan descriptions are still a gap
    Given a 107 whose description is "Box failed. Please advise ASAP."
    When gaps are computed
    Then description is among the gaps

  @validated
  Scenario: Thin 107 still demands SN, OFP, and evidence
    Given the teaching fixture thin-nav-align.xml
    When the XML is ingested
    Then gaps include serialNumber, ofp, and evidence
    And status is awaiting-context

  @validated
  Scenario: Filling the ghost drops hollowness to solid
    Given the ghost 107
    When identity, SN, OFP, description, times, tried, impact, and a log are supplied
    Then gaps are empty
    And hollowness is 0

  @future
  Scenario: Nemotron writes the callback in the unit's voice
    Given a thin 107
    When callback questions are generated
    Then the prose is grounded only in missing fields
    And the model refuses to diagnose
