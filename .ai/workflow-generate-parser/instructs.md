# Objective
You are given a key


For each key:

You need to look at the output of:

scripts/extract-values-of-key.ts
scripts/extract-token-context.ts.  

<tools>
scripts/extract-start-of-line-tokens.ts




and figure out what is the best way to parse the value following the "How to determine the type of the value / parsing" section

# How to determine the type of value / parsing for a key


First, we need to check if the next line in the file also has a key
1. If it does, it is most likely doesn't require multiline parsing and can be parsed as a single line (see Single line parsing). Exception to this is if value is 0, where there is no subsequent lines.
2. If it does not, it may be a multiline array (see Multiline array parsing).

## Single line parsing
Check if the value has commas:
- If it does, parse as a comma-separated list (see Comma-separated parsing)
- If it doesn't, parse as a single value (see parsing values)

### Comma-separated parsing
Each part in a comma separated line needs to be parsed as a single value which can be read in Parsing values section

# Multiline array parsing
Multiline arrays follow a format generally is a "header line" follows by zero or more lines of fixed width.

## Headerlike line
A header line usually consists of a key and a value.
The value has information about the number of values in the array. It can be either:
- a number (easy case)
- a comma-separated list, where one of the values is the number of values in the array (hard case)

The hard case requires looking at many examples to determine which value corresponds to the number of values in the array.

For example of easy case, search "Storage Area Surface Line="

For example of hard case, search "Conn BR: Deck Dist Width WeirC Skew NumUp NumDn MinLoCord MaxHiCord MaxSubmerge Is_Ogee"

# Parsing values
a value can be either:
- a number
- a string
- a boolean
- a duration

Determining which it is can be done by following the rules and guidelines below.

Rules:
If the value is "True" or "False", it is always a boolean
If the value has SEC, MIN, HOUR, DAY, WEEK, MONTH, YEAR in it, it is always a duration

Guidelines (in order of likelyhood / importance):
1. If there are digits in the value, it may be a number or boolean
2. If there are digits and letters, it is always a string
3. If it is a number, it may be an enum mapping. This can be checked by looking at a large number of examples to determine a set of possible values


## Numbers
Numbers that are stored in a comma separated list are usually not fixed width

## Strings
Strings are assumed to be fixed width and are padded with spaces to a fixed width.

## Booleans
Booleans can be formatted in several ways:
1. " 0" is false, "-1" is true
2. "0" is false, "1" is true
3. "False" is false, "True" is true
4. "Disable" is false, "Enable" is true