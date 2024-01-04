---
Title: REQ.TWR2.PROP.VER.7
Status: conflict
System: TWR2.PROP
Class: Requirement
Conflicting With: 11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.2 .md
---

## Description

Pressure vessels shall be proof pressure tested successfully to 1.5 times the maximum expected operating pressure for no less than twice the maximum expected system working time, using the intended flight components. The maximum system working time is defined as the maximum uninterrupted time duration the vessel will remain pressurized during pre-launch, flight, and recovery operations. 

## Source

EuRoC/ IREC Design, Test, & Evaluation Guide 2023 V1.3/ 6.25.1., 6.25.2.- Bartosz Hyży


undefined

undefined

undefinedYES - The given requirement states that pressure vessels should be tested successfully to 1.5 times the maximum expected pressure for a duration that is twice the maximum expected system working time. However, in REQ.TWR2.PROP-CS.VER.2 the condition for leakage tests is given as 8 bar for 180 minutes. There may be a conflict if the maximum expected operating pressure multiplied by 1.5 or the maximum expected system working time doubled does not match the 8 bar for 180 minutes condition. Depending on the actual maximum expected operating pressure and system working time, these conditions might not align. - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.2 .md]]

A possible resolution can be standardizing the testing conditions across all documents, or explaining how both these tests have different objectives and should be executed separately.YES - The given requirement demands a proof pressure test at 1.5 times the maximum expected operating pressure and for a time duration twice that of the maximum expected system working time. Yet, the requirement to compare specifies testing for leakage conditions at a defined pressure (8 bar) for 180 minutes. These two testing conditions may not be the same and thus, a conflict arises. A possible solution would be to harmonize the testing conditions such that the proof pressure test and the leakage test can both be conducted without contradicting each other. - [[11-System_design/Requirements/REQ.TWR2.PROP-CS.VER.2 .md]]