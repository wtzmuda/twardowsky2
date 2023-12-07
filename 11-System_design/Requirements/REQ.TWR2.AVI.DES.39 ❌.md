---
Title: REQ.TWR2.AVI.DES.39
Status: conflict
System: TWR2.AVI
Class:
  - Requirement
ConflictingWith: "[[REQ.TWR2.AVI.DES.20   ]]"
Conflicting With: 11-System_design/Requirements/REQ.TWR2.AVI.DES.20 ❌.md
---

## Description

Any internally mounted RF transmitter, receiver or transceiver, not having the applicable antenna or antennas mounted externally on the airframe, shall employ “RF windows" in the airframe shell plating(typically glass fibre panels), enabling RF devices with antennas mounted inside the airframe, to transmit the signal through the airframe shell. (360 deg with 1 caliber length at each side, up and down, from antena mounting point). Differen kinds of RF antena mounting must provide 360 deg signal with no significnt dead zones

## Source

EuRoC Design, Test & Evaluation Guide; Version 4.1. -Szymon Życiński

# Conflict


YES - The given requirement suggests that any RF devices should not have antennas mounted externally on the airframe, but should have "RF windows" for antennas mounted internally. On the other hand, the requirement to compare suggests that RF antennas should either have "RF windows" for internal mounting or be mounted externally for 360-degree coverage, which contradicts the first requirement - [[11-System_design/Requirements/REQ.TWR2.AVI.DES.20 ❌.md]]

The conflict can be resolved by aligning both requirements to allow for both internal and external mounting while ensuring that both conditions meet the 360-degree coverage requirement.