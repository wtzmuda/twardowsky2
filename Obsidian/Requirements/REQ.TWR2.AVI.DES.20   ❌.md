---
Title: REQ.TWR2.AVI.DES.20
Status: conflict
System: TWR2.AVI
Class: Requirement
ConflictingWith: Requirements/REQ.TWR2.AVI.DES.39 ❌.md
---

## Description

RF transmitter, receivers or transceivers are not allowed to be mounted externally. Any RF antenna should have either: "RF Window" for antennas mounted internally or at least two-sided antenna mounted externally to provide for full 360 coverage. [NOTE] Single antenna mounted on the rear-fin of a flight vehicle will be insufficient, since the exhaust flames are highly disruptive towards the RF signals

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.6

# Conflict

YES - The given requirement states RF transmitters, receivers or transceivers cannot be externally mounted, precisely contradicting the requirement in the file that says “RF windows" should be employed for RF devices with antennas mounted inside the airframe, if not externally mounted on the airframe. The conflict involves the location of mounting the RF devices - the given requirement insists on internal mounting, while the requirement in the file allows for external mounting - [[Requirements/REQ.TWR2.AVI.DES.39 ❌.md]]. The conflict can be resolved by clarifying whether external mounting is allowed or not and ensuring both requirements align. If external mounting is prohibited, the file requirement should be revised to remove any mention of external mounting. If allowed, the given requirement should be modified accordingly.
