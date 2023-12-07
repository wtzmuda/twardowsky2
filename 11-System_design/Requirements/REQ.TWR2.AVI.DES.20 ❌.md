---
Title: REQ.TWR2.AVI.DES.20
Status: conflict
System: TWR2.AVI
Class:
  - Requirement
ID: TWR2.AVI.REQ.TWR2.AVI.DES.20
Conflicting With: Requirements/REQ.TWR2.AVI.DES.39 ❌.md
---

## Description
RF transmitter, receivers or transceivers are not allowed to be mounted externally. Any RF antenna should have either: "RF Window" for antennas mounted internally or at least two-sided antenna mounted externally to provide for full 360 coverage. [NOTE] Single antenna mounted on the rear-fin of a flight vehicle will be insufficient, since the exhaust flames are highly disruptive towards the RF signals

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.6


# Conflict

YES - The conflict lies in the location of the RF transmitters/receivers. The first requirement states that these devices cannot be mounted externally, yet the second requirement implies that an internal device should employ "RF windows" only if antennas are not mounted externally. This suggests the second requirement may allow for external mounting. A possible resolution could be refining the language in both requirements to ensure a clear consensus on the location of these devices. - [[Requirements/REQ.TWR2.AVI.DES.39 ❌.md]]