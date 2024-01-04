---
Title: REQ.TWR2.PROP-CS.PHYS.5
Status: conflict
System: TWR2.PROP-CS
Class: Requirement
Conflicting With: 11-System_design/Requirements/REQ.TWR2.PROP-CS.PHYS.4 .md
---

## Description

Combustion chamber insulation shall allow the combustion chamber hardware to withstand temperature loads (3300K) for the time of work (10s)

## Source

TWR 2 propulsion


NO - [There doesn't appear to be any conflicts between these requirements. The given requirement pertains to temperature loads and duration, the first requirement to compare speaks to mechanical loads, the second one refers to pressure and duration, and the third one addresses testing. These specifications are dealing with different aspects of the combustion chamber's functionality and should not conflict unless specific material, design or procedures counteract.]YES - The time of work given in the first compared requirement (20s) contradicts with the time of work given in the given requirement (10s). - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.PHYS.4 .md]] 

One possible way to resolve this issue might be adjusting one of the time frames to match with the other one after considering engineering constraints and the overall mission goals.YES - The given requirement and the first compared requirement may conflict. The given requirement suggests the chamber will operate at 3300K for 10 seconds, but the compared requirement states that the chamber needs to withstand a pressure of 45 bar for 20 seconds. If the chamber can only endure high temperatures for half of the required pressure duration, this could result in damage or failure. - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.PHYS.4 .md]]

To resolve the issue, we should aim to improve the insulation of the combustion chamber or redesign it so that the temperature can be maintained for a longer duration. This might involve using different materials for insulation or altering the combustion chamber's design to dissipate heat more effectively.

[[11-System_design/Requirements/REQ.TWR2.PROP-CS.PHYS.4 .md]] should be updated to make sure both conditions (temperature and pressure) can be sustained for the same duration.