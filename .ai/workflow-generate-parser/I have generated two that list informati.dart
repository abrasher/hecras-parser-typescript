I have generated two that list information from a file that I want to parse. I need you to try your best to figure out how the file is divided into sections and what keys are the start of a section, and what keys belong to that section. 

Output 1 is a list of tokens and Output 2 is all the tokens in the order they appear in the file.

The file I am parsing is a HECRAS unsteady flow file.

Output your response as indicated in <response-format>

<response-format>
<structure>
{
  "headerKeys": ["key1","key2"],
  "sections": [
    { 
      "name": "section1Name",
      "startKey": "startKey",
      "keys": ["key1","key2"]
      "subsections": [
        { 
          "name": "section2Name",
          "startKey": "startKey",
          "keys": ["key1","key2"],
          "subsections": [
            ...
          ]
      ]
    },
    ...
  ]
}
</structure>

<output1>
{
  "file": "BaldEagleDamBrk.u08",
  "tokens": {
    "Flow Title": 1,
    "Program Version": 1,
    "Use Restart": 1,
    "Initial Flow Loc": 3,
    "Initial Storage Elev": 3,
    "Initial RRR Elev": 2,
    "Boundary Location": 9,
    "Interval": 7,
    "Lateral Inflow Hydrograph": 4,
    "DSS File": 5,
    "DSS Path": 7,
    "Use DSS": 7,
    "Use Fixed Start Time": 7,
    "Fixed Start Date/Time": 7,
    "Is Critical Boundary": 7,
    "Critical Boundary Flow": 7,
    "Uniform Lateral Inflow Hydrograph": 2,
    "Friction Slope": 1,
    "Flow Hydrograph": 1,
    "Flow Hydrograph QMin": 1,
    "Flow Hydrograph Slope": 1,
    "Gate Name": 1,
    "Gate DSS Path": 1,
    "Gate Use DSS": 1,
    "Gate Time Interval": 1,
    "Gate Use Fixed Start Time": 1,
    "Gate Fixed Start Date/Time": 1,
    "Gate Openings": 1
  },
  "emptyLineNumbers": [
    157
  ],
  "emptyLineCount": 1
}
</output1>

<output2>
{
  "file": "BaldEagleDamBrk.u08",
  "keys": [
    "Flow Title",
    "Program Version",
    "Use Restart",
    "Initial Flow Loc",
    "Initial Flow Loc",
    "Initial Flow Loc",
    "Initial Storage Elev",
    "Initial Storage Elev",
    "Initial Storage Elev",
    "Initial RRR Elev",
    "Initial RRR Elev",
    "Boundary Location",
    "Interval",
    "Lateral Inflow Hydrograph",
    "DSS File",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Interval",
    "Lateral Inflow Hydrograph",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Interval",
    "Uniform Lateral Inflow Hydrograph",
    "DSS File",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Interval",
    "Lateral Inflow Hydrograph",
    "DSS File",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Interval",
    "Lateral Inflow Hydrograph",
    "DSS File",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Interval",
    "Uniform Lateral Inflow Hydrograph",
    "DSS File",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Friction Slope",
    "Boundary Location",
    "Interval",
    "Flow Hydrograph",
    "Flow Hydrograph QMin",
    "Flow Hydrograph Slope",
    "DSS Path",
    "Use DSS",
    "Use Fixed Start Time",
    "Fixed Start Date/Time",
    "Is Critical Boundary",
    "Critical Boundary Flow",
    "Boundary Location",
    "Gate Name",
    "Gate DSS Path",
    "Gate Use DSS",
    "Gate Time Interval",
    "Gate Use Fixed Start Time",
    "Gate Fixed Start Date/Time",
    "Gate Openings"
  ]
}
</output2>