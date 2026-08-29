Feature: Import from web and folder
  Same ingest, two doors.

  @validated
  Scenario: Webpage paste creates a case via the ingest API
    Given a valid TechnicalAssistanceRequest
    When it is posted to /api/ingest?source=web
    Then the case appears on the queue
    And an inbound XML message is stored on the envelope

  @validated
  Scenario: Folder scan moves good files to processed
    Given ghost-box-failed.xml in data/inbox
    When POST /api/import/folder
    Then the file is no longer in inbox
    And an import_run records files_ok >= 1

  @future
  Scenario: Network share watch
    Given a mounted unit drop-box
    When a 107 lands there
    Then ingest runs without a webpage click
