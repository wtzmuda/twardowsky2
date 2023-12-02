---
Title: REQ.TWR2.AVI.DES.20
Status: in-review
System: TWR2.AVI
Class:
  - Requirement
ID: TWR2.AVI.REQ.TWR2.AVI.DES.20
---

## Description
RF transmitter, receivers or transceivers are not allowed to be mounted externally. Any RF antenna should have either: "RF Window" for antennas mounted internally or at least two-sided antenna mounted externally to provide for full 360 coverage. [NOTE] Single antenna mounted on the rear-fin of a flight vehicle will be insufficient, since the exhaust flames are highly disruptive towards the RF signals

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.6


# Conflict

YES - The first requirement states that RF devices should not be mounted externally, whereas the second requirement allows for RF devices mounted internally without an externally mounted antenna to use "RF windows". This can be conflicting if an RF device needs to be mounted internally but cannot use an "RF Windows", as the first requirement does not allow for external mounting, rendering the RF device unusable - [[Requirements/REQ.TWR2.AVI.DES.39 ❌.md]]

A possible resolution could be to provide exceptions for RF devices that need to be mounted internally but cannot use 'RF Windows' to be allowed external mounting, or to re-evaluate the necessity of the stipulation that no RF devices are allowed to be mounted externally.