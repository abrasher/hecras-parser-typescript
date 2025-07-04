Conn BR: Bridge=momentumEquationFriction,momentumEquationWeight,pressureFlowCriteria,classBDefaults, 0 ,0.3,0.5

## Momentum Equation

add friction
Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5

add weight
Conn BR: Bridge=0,-1,-1,-1, 0 ,0.3,0.5

add friction
add weight
Conn BR: Bridge=-1,-1,-1,-1, 0 ,0.3,0.5

-1 means enabled, 0 means disabled

Conn BR: Bridge=0,0,-1,-1, 0 ,0.3,0.5

## Class B Defaults

Inside Bridge at Upstream End
Conn BR: Bridge=0,0,-1,-1, 0 ,0.3,0.5

Inside Bridge at Downstream End
Conn BR: Bridge=0,0,-1,0, 0 ,0.3,0.5

## Pressure Flow Criteria

Upstream Energy Gradeline
Conn BR: Bridge=-1,0,-1,-1, 0 ,0.3,0.5

Upstream water surface
Conn BR: Bridge=-1,0,0,-1, 0 ,0.3,0.5
