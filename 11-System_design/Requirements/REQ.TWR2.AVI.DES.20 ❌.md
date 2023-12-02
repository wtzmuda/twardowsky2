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

YES - The conflict lies between the permission for the usage of externally mounted antennas in the comparison requirement and the prohibition of any externally mounted RF devices in the given requirement - [[Requirements/REQ.TWR2.AVI.DES.39 ❌.md]]. This issue can be resolved by clarifying and unifying the requirement for the placement of RF devices. If the system design allows, it may be necessary to allow externally mounted antennas or completely limit to internal mounting.