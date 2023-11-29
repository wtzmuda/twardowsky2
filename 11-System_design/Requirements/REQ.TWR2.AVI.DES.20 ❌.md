---
Title: REQ.TWR2.AVI.DES.20
Status: in-review
System: TWR2.AVI
Class: Requirement
ConflictingWith: Requirements/REQ.TWR2.AVI.DES.39 ❌.md
Conflicting-with: 
ID: TWR2.AVI.REQ.TWR2.AVI.DES.20
---

## Description
RF transmitter, receivers or transceivers are not allowed to be mounted externally. Any RF antenna should have either: "RF Window" for antennas mounted internally or at least two-sided antenna mounted externally to provide for full 360 coverage. [NOTE] Single antenna mounted on the rear-fin of a flight vehicle will be insufficient, since the exhaust flames are highly disruptive towards the RF signals

abc | chuj

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.6


# Conflict

YES - The given requirement states that RF transmitter, receivers or transceivers are not allowed to be mounted externally, which directly conflicts with the requirement to compare, which assumes the possibility of externally mounted antennas. - [[REQ.TWR2.AVI.DES.39 ❌]]

Potential conflict resolution: Align the requirements by either allowing externally-mounted antennas (in cases where it's technically possible and doesn't pose hazards or inefficiencies), or adjust the second requirement to only concern internally-mounted systems.