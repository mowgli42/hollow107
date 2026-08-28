Feature: Ingest XML 107s
  The prototype must accept invented TAR XML and refuse everything else.

  @validated
  Scenario: Ghost 107 parses and is flagged hollow
    Given the teaching fixture ghost-box-failed.xml
    When the XML is ingested
    Then the description contains "Box failed"
    And hollowness is at least 80
    And status is awaiting-context

  @validated
  Scenario: Foreign XML is rejected
    Given a document "<note>hello</note>"
    When parse is attempted
    Then ingestion fails

  @future
  Scenario: Official JDRS package ingest
    Given a signed JDRS export
    When the package is ingested
    Then fields map to the official 00-25-107 schema
