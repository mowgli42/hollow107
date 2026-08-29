Feature: Team landing displays
  Other UIs consume per-team JSON. This app renders /t/:slug.

  @validated
  Scenario: Seeded FSR landing only shows context work
    Given cases in awaiting-context and in-resolution
    When GET /api/teams/fsr/cases
    Then only awaiting-context (and ingested) cases are returned

  @validated
  Scenario: Creating a display yields a landing URL
    Given a POST /api/teams body with slug "nav-lab"
    Then the response includes landing /t/nav-lab
    And casesApi /api/teams/nav-lab/cases

  @future
  Scenario: Team displays require CAC groups
    Given a signed-in engineer
    Then /t/qa is forbidden
