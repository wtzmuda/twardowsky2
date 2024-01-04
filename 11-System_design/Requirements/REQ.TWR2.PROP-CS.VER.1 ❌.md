---
Title: REQ.TWR2.PROP-CS.VER.1
Status: conflict
System: TWR2.PROP-CS
Class: Requirement
Conflicting With: Requirements/REQ.TWR2.AVI.DES.33  ❌.md
---

## Description

During pressure proof test conditions (90 bar for 180 minutes) the maximum allowable pressure drop is less than 0.5 bar

## Source

TWR 2 propulsion


NO - [The requirements do not conflict as the pressure thresholds, durations and the tolerances for pressure drops are consistent across the tests. Additionally, the pressure sensor requirement, mentioning that the sensor's drift should be smaller than 0.5 bar in 180 minutes, aligns with the allowable pressure drop mentioned in the testing conditions. Therefore, the requirements complement each other without any contradictions.]YES - The pressure sensor's drift defined by the producer being smaller than 0.5 bar in 180 minutes may conflict with the pressure proof test conditions which require a maximum allowable pressure drop less than 0.5 bar for the same duration. This could potentially mean the sensor's total pressure drift could reach the threshold of the pressure drop criteria during the pressure proof test, therefore hindering proper test result analysis - [[Requirements/REQ.TWR2.AVI.DES.33  ❌.md]]

Possible resolution: A re-evaluation of the pressure sensor's capability might be necessary. If discrepancy persist, a selection of a more suitable pressure sensor meeting the maximum pressure drop condition could be a potential solution.YES - The conflict is between the testing requirements. In the first requirement, the test should be continued for 180 minutes while in the other requirement the maximum pressure duration is for only 90 minutes - [[Requirements/REQ.TWR2.AVI.DES.33  ❌.md]]

To resolve this conflict, both tests need to be done for the same duration. For example, if realistic operating conditions require a pressure duration of 180 minutes, both tests should be done for that duration. If, on the other hand, realistic conditions do not require more than 90 minutes, then this should be the duration for both tests.