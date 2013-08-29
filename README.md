# Whiskers
###### By Sean J MacIsaac (seanjmacisaac@gmail.com)
###### VERSION: 0.7

###### The MIT License (MIT)

###### This script requires jQuery to work and it is included

## INITIATING A WHISKER
    {:[Your Whiskers in Here]:}

Else, any whisker templates, loops and variables will not be evaluated.

## TEMPLATES
Templates are `template-name

To add a template to a page, simply include the script and add `template

## PASSING VALUES
#### Single Values
    `template-name{property:value|%variable}
#### Multiple Values
    `template-name{
        property:value|%variable;
        property:value|%variable;
    }

## VARIABLES
Variables are %variable-name

## LOOPS
A loops requires a variable with an iterator, that is a JSON value with an array of key/value pairs.
An example of a Whiskers compatible iterator would be:
    iterator: [{
        name: Sally
    },{
        name: Michael
    }]

Putting this iterator into a template is done like this:
    %iterator`template
