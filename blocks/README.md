The format of each file in this directory is:

  - 9999_lower_case_name.htm

Where 9999 are digits from 0000 to 9999 and set the order of blocks appearing in the editor menu.

The filename part 'lower_case_name' will be turned into a menu title 'Lower Case Name'

The class (for applying CSS colour to) will becme 'quando-lower-case-name-of-colour-group'

In each file, blocks must each be separated by at least one blank line and must include in the outer div a 'data-quando-block-type' which has the unique identifier for type of block - this must be unique within Quando - and should use 'a-hyphen-separated-id'.

__For historic reasons, many blocks will have the form 'menuname-blockid', e.g. 'media-prompt'.  This allows older Clips to be loaded and is not a required format.__