/** Sim 107s. The ghost case is the teaching artifact: how bad a field request can be. */

export const GHOST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TechnicalAssistanceRequest>
  <requestType></requestType>
  <priority>emergency</priority>
  <submittedAt>2026-08-12</submittedAt>
  <unit></unit>
  <site></site>
  <pocName></pocName>
  <pocContact></pocContact>
  <mds></mds>
  <nsn></nsn>
  <partNumber></partNumber>
  <serialNumber></serialNumber>
  <ofp></ofp>
  <icd></icd>
  <toInUse></toInUse>
  <description>Box failed. Please advise ASAP.</description>
  <bitCode></bitCode>
  <firstSeen></firstSeen>
  <lastKnownGood></lastKnownGood>
  <alreadyTried></alreadyTried>
  <missionImpact></missionImpact>
  <logAttached>false</logAttached>
  <noLogReason></noLogReason>
</TechnicalAssistanceRequest>`;

export const THIN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TechnicalAssistanceRequest>
  <requestType>TAR</requestType>
  <priority>routine</priority>
  <submittedAt>2026-08-20</submittedAt>
  <unit>77 MXS</unit>
  <site>Nellis</site>
  <pocName>SSgt Reyes</pocName>
  <pocContact>reyes@example.mil</pocContact>
  <mds></mds>
  <nsn></nsn>
  <partNumber>NAV-12A</partNumber>
  <serialNumber></serialNumber>
  <ofp></ofp>
  <icd></icd>
  <toInUse></toInUse>
  <description>NAV align fail after cold soak on GPS-1. Happened twice this week.</description>
  <bitCode>0x1A</bitCode>
  <firstSeen>2026-08-18</firstSeen>
  <lastKnownGood></lastKnownGood>
  <alreadyTried>Power cycle</alreadyTried>
  <missionImpact>Abort if GPS-1 required</missionImpact>
  <logAttached>false</logAttached>
  <noLogReason></noLogReason>
</TechnicalAssistanceRequest>`;

export const SOLID_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TechnicalAssistanceRequest>
  <requestType>TAR</requestType>
  <priority>routine</priority>
  <submittedAt>2026-08-22T14:03:00Z</submittedAt>
  <unit>77 MXS</unit>
  <site>Nellis</site>
  <pocName>SSgt Reyes</pocName>
  <pocContact>reyes@example.mil</pocContact>
  <mds>XX-9</mds>
  <nsn>5825-01-000-0000</nsn>
  <partNumber>NAV-12A</partNumber>
  <serialNumber>SN-14</serialNumber>
  <ofp>12.3</ofp>
  <icd>4.2</icd>
  <toInUse>TO 12P5-XX-1</toInUse>
  <description>NAV align fail after cold soak on GPS-1 only. Warm start and GPS-2 succeed. BIT 0x1A latches on first power-up below -15 C.</description>
  <bitCode>0x1A</bitCode>
  <firstSeen>2026-08-18T06:10:00Z</firstSeen>
  <lastKnownGood>2026-07-02 after OFP 12.1</lastKnownGood>
  <alreadyTried>Power cycle; swapped GPS-2 known-good (still fails on GPS-1 path); ran ATP 4.2 align card.</alreadyTried>
  <missionImpact>Cannot accept GPS-1 for envelope expansion; GPS-2 remains available.</missionImpact>
  <logAttached>true</logAttached>
  <noLogReason></noLogReason>
</TechnicalAssistanceRequest>`;

export const SOLID_LOG = `# NAV-12A SN-14 OFP 12.3  2026-08-18T06:10:00Z
PWR_ON t=0 temp_c=-18
BIT 0x1A ALIGN_FAIL src=GPS-1
GPS-2 ALIGN_OK t=12.4s
WARM_START GPS-1 ALIGN_OK t=40.1s temp_c=-4`;
