<div align="center">
    <img src="07-Administration/03-PR/00-Git/git_twr_2_logo.png" alt="Logo" width=500/>

  <h3 align="center"><strong>Twardowsky 2</strong><br/>SKA Rocketry Division</h3>

  <p align="center">
      <a href="https://wutwaw-my.sharepoint.com/:f:/g/personal/01171578_pw_edu_pl/EmQTOotIGo9FmwbVG2P4nIABuc8mOalsro14rPONq2J7Fg" target="_blank"><strong>See project's sharepoint »</strong></a>
    <br />
    <br />
    <a href="https://gitlab.com/sekcja-rakietowa-ska/twardowsky2/-/commits/main?ref_type=heads">Commits</a>
    ·
    <a href="https://gitlab.com/sekcja-rakietowa-ska/twardowsky2/-/branches">Branches</a>
    ·
    <a href="https://gitlab.com/sekcja-rakietowa-ska/twardowsky2/-/issues">Issues</a>
  </p>
</div>

## Getting started

Run `git clone https://gitlab.com/sekcja-rakietowa-ska/twardowsky2.git`

*Do not have a git? Ask our coordinator for help!*

Remember to run `RunThisWhenYouClone.sh` command after cloning this repository. This makes sure that Your commit messages are correctly formatted and up to our standards.

Also we have strict messaging and naming standards. Please read *Git messages standards* section .

## Project description

Twardowsky 2 is a hybrid-engine rocket with ability to carry payload in the form of cansat experiments. It is being developed by the Student's Space Association's Rocketry Division on Warsaw University of Technology.

## Git messages standards

Correct formmat for our messages is:
`[TAG] commit-message` or `#issue-number commit-message`

Where: 
* **TAG** - Points out which system does this commit concern? 
* **#issue-number** - Points out which issue does this commit concern?
* **commit-message** - Is a description of the changes. Remember it is not ught to be short. It should be as descriptive and precise as it can be.

*Example: [PLD] Changed strings on payload's module.*

### Commit tags
Below are listed possible tags with it's description:

* **[TWR]** - Twardowsky - concerning whole project (like req / risk changes), can be used with other tags to specify but there are files that concern the whole project
* **[GSG]** - Ground segment - concerning GSE, mission control, procedures for launches etc.
* **[SPC]** - Spacecraft - technical changes to TWR assembly
* **[NSC]** - Nosecone
* **[PLD]** - Payload
* **[REC]** - Recovery
* **[PRP]** - Propulsion
* **[AVI]** - Avionics (I know seems kinda redundant since we have NSC but there are SE aspects that could concern only Avionics)
* **[CTS]** - COTS/standardized elements changes
* **[MNG]** - Management / organizational
* **[SYS]** - Systems engineering
* **[OTH]** - doesn't fit any of the above (might suggest that there's need for new tag)

*Feel free to contact Your coordinator if You have any doubts or remarks.*

### Commit issues
Below are listed possible issues with it's description: 

* **#1** - Construction/mechanical/technical
* **#2** - Electronics/software/firmware
* **#3** - Documentation
* **#4** - Systems Engineering
* **#5** - Analysis
* **#6** - Management/administration
* **#7** - Finances/orders
* **#8** - Competitions
* **#9** - Research
* **#10** - Other

## Contact

1. **Project coordinator** - Eliza Łapińska - yes sir#1909
