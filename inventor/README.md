# Quando - Inventor Blocks

## Editing as a Developer

The instructions below assume that you are using Visual Studio Code, though specifics are generally avoided.

From the Visual Studio Code, you need to:

1. Run the pouchdb database, using `npm run pouchd` from the Terminal
2. Run `node server.js`, e.g. through Launch
3. Open a Browser to 127.0.0.1/inventor

## Block Development using Inventor Blocks

Visual Blocks can be developed using Inventor Blocks.  There is little error handling - so be aware that the generated Html may not make sense.

The Html is inserted in inventor/index.html - typically after a 'title' div - see index.html for examples.

### Creating a hello world block:

Drag into the inventor, the following blocks, with nesting shown by indentation:

```
Block [alert('${txt}')]
  Row
    Text [Say]
    Input [txt] Default []
Class [Media]
```

Note that anything in square brackets will need to be chosen/entered.

Then click the 'Code' Button, and select the generated code, which should look like:

```html
<div class="quando-block" data-quando-javascript="alert('${txt}')">
<div class="quando-left quando-media"></div>
<div class="quando-right">
      <div class="quando-row quando-media">
              Say
              <input data-quando-name="txt" type="text" value=""/>
</div>
</div>
</div>
```


