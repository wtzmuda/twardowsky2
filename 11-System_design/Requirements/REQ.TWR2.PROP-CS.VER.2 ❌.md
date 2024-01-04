---
Title: REQ.TWR2.PROP-CS.VER.2
Status: conflict
System: TWR2.PROP-CS
Class: Requirement
Conflicting With: 11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.1 ❌.md
---

## Description

During leakage test conditions (8 bar for 180 minutes) the maximum allowable pressure drop is less than 0.5 bar

## Source

TWR 2 propulsion


NO - [The requirements do not conflict because they pertain to different testing conditions and pressures. The first requirement refers to a leakage test at 8 bar, the second to a pressure proof test at 90 bar, and the third to a filling and pressurization procedure at a max of 60 bar. Each requirement has the same allowable pressure drop of less than 0.5 bar, but this value is not in conflict across the different conditions and pressures.]YES - There is a conflict between the given leakage test condition and the proof pressure test conditions as well as the condition regarding the tank pressurization. The pressure for the proof test condition and tank pressurization is significantly higher than the given leakage test condition. This may result in different maximum allowable pressure drops, leading to potential conflicts - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.1 ❌.md]], [[Requirements/REQ.TWR2.AVI.DES.33  ❌.md]]. To resolve the issue, it would be better to harmonize and clearly define the pressure conditions and allowable pressure drops across all tests.YES - The first and third requirements specified different pressure and time conditions for a test, causing a conflict - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.1 ❌.md]], [[undefined]]. A better way to resolve it would be to standardize the conditions for the pressure test and define it in one requirement.