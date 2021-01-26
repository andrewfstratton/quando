# A Quando Manifesto

This is a set of guidelines, principles and rules for Quando.

## Reject programming concepts wherever possible

Quando hides/avoids programming concepts from editors.  Apart from the Inventor blocks, and some Advanced blocks, the editor has:
- no functions/procedures
  - messages passing and Displays allow some state based aspects
- no classes
  - except those already created as part of blocks
- no loops
  - iteration exists, but there are no logic or counters for loops.  Event handling allows similar features with Every/Per and Vary
- no maths
  - maths is implicit, e.g. rotation is by a 0 to 1 value around a range 0f -180 to +180 degrees
  - there is no addition, subtraction, multiplication, division
- no if conditional code
  - An if within a loop doesn't exist. There are many conditional blocks, but 'if' is not used since it is **heavily loaded**, i.e. it has too many sequential connotations.  Instead, When is used, such as 'When an AR marker is seen'.  This is an event handler that only matches at the right **time**.
- no else statements
  - There is no 'else' statement.  Since the main concept is an Event, it makes little sense to have an 'if not' or else, since this would be the same as 'whenever not' - which is most of the time.  There are similar blocks, but they are currently time and state dependant, i.e. happening later, e.g. When AR marker seen, followed by, then when lost.  Another example is When Idle...then when Active.
- no repeat Events
  - Events should be raised only when something changes.  So a 'When Fist' block is only raised when a fist is made, and does not repeat until a flat hand has been made and then another fist.
  - Note however, that a 'When mouse moved' will raise an event up to a limit of c30 times a second.  More movements may be handled, but the changes position will only raise an event c30 times a second. 
  
## Blocks should be simple

This puts the honus on the developer to create a predictable, simple system of blocks that together can be used to describe most situations (but likely not all).

## Develop what is needed now

If something isn't needed now, then try and avoid adding unnecessary complexity.  This isn't always possible.

## Blocks should hide anything not needed

The '+' Extras block is invaluable for hiding the rarely needed, distracting, block parameters.

## There are only two types of values

The ⚡, or 'val' in code, is a floating point number from 0 to 1.  This represent all ranges, including linear and rotation

The ❓, or 'txt' in code, is a string.

- Blocks can 'consume' only one value
- Blocks can only 'produce' one value

For example, a When mouse is moved will only produce an event (with a val) in the x or y dimension.  So to handle both, two When statements are needed, that are defined separately.

## Visible UI values must be sensible

For example, the standard time unit in most programming languages/APIs is milliseconds, introducing another layer of unnecessary complexity.  Quando uses seconds/minutes/hours/days within blocks and passed to the APIs.  Within the APIs, milliseconds will (at some point) be used.

The 'times per' blocks shows how an Every block can be shown in a more understandable form.  So doing something 25 times a second doesn't have to be 'Every 0.04 seconds', or every 40 milliseconds, but can be '25 times per second'.

## Quando has an Event first paradigm

Without loops, there can be no 'game loop'. Something similar can be done with Every/Per/Vary blocks - but these should seek to allow for iterations to be skipped.

Quando scripts usually are setup scripts that put everything in place to react to user (or possibly timing) events.

## Code and Convention over configuration

Configuration is through action blocks, so they can be reused when needed.  e.g. the normal/rear projection block is not a configuration parameter, it is an action block, so can be used anywhere, though it would typically be one of the first blocks in a script.

## Blocks should do the expected thing

e.g. the defaults should be expected.  So the default unit of time is seconds.

## Obviously wrong parameters should be used

This can conflict with the previous principle.  e.g. an idle block should go wrong very quickly - so the default timeout is 1 second, i.e. obviously wrong.  If the default value was 5 minutes, it might never be encountered when testing.

## Use text to add meaning

Blocks need to be described with succinct, precise, but also obvious language.  Engineering terms should be avoided wherever possible.  Domain specific terms can be used where the blocks are domain specific (blocks can also be reskinned for domains).  Choosing the right words, and their order, will often require three, or more, iterations.

## Match the standard block form where possible.

Blocks have a standard first line of [⚡/❓][icon]text and UI[⚡/❓][+]

## Icons

Unicode icons are used to represent commonality with other blocks.  There aren't enough unicode icons to represent everything needed, especially concepts, but at present no other graphics are embedded.  Iconizing text can also help.