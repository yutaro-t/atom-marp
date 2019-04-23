
<!--size: 16:9 -->
<!--headingDivider: 2 -->
<!-- theme: test-theme -->
<!--style: |
  code {
    background-color: #f6f8fa;
    color: #9da5b4;
  } -->


# Input Language of CLINGO

戸塚悠太郎　輪講
19/4/24

## Table of contents

* Rules
* Directives and Comments
* Arithmetric
* Definitions
* Choice Rules
* Global and Local Variablles
* Constraints
* Anonymous Variables

## Rules

```Prolog
large(C) :- size(C,S1), size(uk,S2), S1 > S2.

```
