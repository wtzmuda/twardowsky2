---
Title: REQ.TWR2.AVI.DES.20
Status: conflict
System: TWR2.AVI
Class:
  - Requirement
ID: TWR2.AVI.REQ.TWR2.AVI.DES.20
Conflicting With: 11-System_design/Requirements/REQ.TWR2.AVI.DES.39 ❌.md
---

## Description
RF transmitter, receivers or transceivers are not allowed to be mounted externally. Any RF antenna should have either: "RF Window" for antennas mounted internally or at least two-sided antenna mounted externally to provide for full 360 coverage. [NOTE] Single antenna mounted on the rear-fin of a flight vehicle will be insufficient, since the exhaust flames are highly disruptive towards the RF signals

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.6


# Conflict

YES - The conflict lies in the location of RF transmitters, receivers or transceivers, and antennas; the given requirement mandates no external mountings, whereas the requirement in comparison implies the possibility of such installations. - [[11-System_design/Requirements/REQ.TWR2.AVI.DES.39 ❌.md]] 
A possible resolution would be to agree upon fixed locations for the RF devices and the antennas, either internally with RF windows or externally considering the "360 deg" coverage rule.