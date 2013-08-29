# Whiskers
#### By Sean J MacIsaac (seanjmacisaac@gmail.com)
#### VERSION: 0.5

#### The MIT License (MIT)
#### Copyright (c) 2013 Sean J MacIsaac

#### This script requires jQuery to work and it is included

### TEMPLATES
Templates are ``template-name

To add a template to a page, simply include the script and add `template

#### PASSING VALUES
#### Single Values
    `template-name{property:value|%variable}
#### Multiple Values
    `template-name{
        property:value|%variable;
        property:value|%variable;
    }

### VARIABLES
Variables are %variable-name

### LOOPS
A loops requires a variable with an iterator, that is a JSON value with an array of key/value pairs.
%iterator`template
