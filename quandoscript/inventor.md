# Inventor 

Blocks to be rewritten (when needed) as Widgets

## Done

3. Text --> Text, with Iconify().Bold().Italic()
2. Fixed Space --> under Character.FIXED_SPACE
15. Icon (inc direction) --> in Character
4. Input --> StringInput(name) with Default().Empty()
    - always surrounds textfield with "
    - todo add to generator+api 
4. Input --> NumberInput
    - similar to stringinput but has number width, min, max
4. Input --> Percent
    - adds a percent sign to output and min and max are preset
1. Create generator for editor
      - lookup includes the class at the start - before the '.'  Syntax should be updated to reflect this
      - api library held in class as well as qid (lookup)

## In progress

1. Create generator for editor
    - part of the initial block definition?  inc. lookup/UI ID
      - boxes are added differently...
      - block generator isn't included...yet
    - note that Block/line number is the Block Id

## To Be done :

5. Menu
6. Toggle --> likely automatic from menu, when only two options, with possible override either way
7. Show on Toggle --> some form of encapsulation...
8. Choice --> had visible and hidden value
    - some may be optional, e.g. if numeric index is used
9. Parameters (3 of) --> these should become redundant
10. Raw --> check if needed?
11. Extras --> a kind of toggle but on hover (?) with the +/- options also shown on hover to allow stay open
12. inverted --> ??
13. Hover text on ? and ! --> ??
14. fn - param value --> automatic...