export const prompt1 = (filePath: string) => {
  const listOfTokenOutput = ""
  const listOfOrderedTokensOutput = ""

  return `I have generated two that list information from a file that I want to parse. I need you to try your best to figure out how the file is divided into sections and what keys are the start of a section, and what keys belong to that section. 

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
${listOfTokenOutput}
</output1>

<output2>
${listOfOrderedTokensOutput}
</output2>`
}
