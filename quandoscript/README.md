# quandoscript
Script engine for Quando

Here is the (growing) script definition, where _xxx:: is the definition of xxx_

```mermaid
graph LR
    stop((( )))
    start((( )))--> sequence --> stop
    sequence --> nl["↵"] --> sequence
```

```mermaid
graph LR
    stop((( )))
    sequence::---line-->nl["↵"]--> stop
    nl-->line
```

```mermaid
graph LR
    stop((( )))
    id-->stop
    line::---id-->spacer-->action-->stop
```

```mermaid
graph LR
    stop((( )))
    id::---digit-->s( )-->stop
    s-->digit
```

```mermaid
graph LR
    stop((( )))
    digit::--- 0..9--> stop
```

```mermaid
graph LR
    stop((( )))
    spacer::---l[ ]-->s["#quot; #quot;"]-->r[ ]-->stop
    l-->tab-->r
    r-->l
```

```mermaid
graph LR
    stop((( )))
    action::--- word--> params --> stop
```

```mermaid
graph LR
    stop((( )))
    word:: --- letter-->stop
    letter-->l( )-->rl["letter"]-->r( )-->stop
    r-->l
    l-->dot["."]-->r
    l-->u["_"]-->r
    l-->digit-->r
```

```mermaid
graph LR
    stop((( )))
    letter::---l( )--> a..z--> stop
    l--> A..Z--> stop
```

```mermaid
graph LR
    stop((( )))
    params:: --- l["("] --> r[")"]-->stop
    l--> param--> r
    param-->c[","]-->param
```

```mermaid
graph LR
    stop((( )))
    param:: --- word --> value-->stop
    word --> variable --> stop
```

```mermaid
graph LR
    stop((( )))
    variable:: ---l["="] --> word --> stop
```

```mermaid
graph LR
    stop((( )))
    value:: --- l[ ]
    l--> b[!]--> boolean -->stop
    l--> q[#quot;] -->characters --> qr[#quot;] -->stop
    l--> h["\#"]-->FLOATING_POINT -->stop
    l--> c[":"]--> id -->stop
```

```mermaid
graph LR
    stop((( )))
    boolean::---l( )--> true --> stop
    l-->false --> stop
```

```mermaid
graph LR
    stop((( )))
    characters::---l[ ]--> UNICODE-->r[ ]--> stop
    l-->prefix_character -->r
    r-->l
```

```mermaid
graph LR
    stop((( )))
    prefix_character::--- l["\"]-->slash["\"]--> stop
    l-->q[#quot;]-->stop
    l-->n-->stop
    l-->t-->stop
```

Optional

- Range
    - % full (0..1)
    - / half (0.5..1)
    - ~ plus_minus (0.5 +/- 0.5)
    - **or should I now switch to -1 to +1**
- true/false/either, e.g. for press/release/either
  - see also temporal logic
  - the difference here is between the press/release change of state and the actual press**ed**/releas**ed** state