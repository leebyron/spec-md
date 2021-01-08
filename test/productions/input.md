Productions
-----------

# Grammar

A production can be on one line

PBJ: Bread PeanutButter Jelly Bread

A production can wrap across lines

PBJ:
  Bread PeanutButter
    Jelly Bread

A production can have multiple definitions

PBJ:
  - Bread PeanutButter Jelly Bread
  - Bread PeanutButter Jelly Bread

Which can break lines

PBJ:
  - Bread PeanutButter
    Jelly Bread
  - Bread PeanutButter Jelly Bread

And conditions

PBJ:
  - [if
    Hungry]
    Bread
    Peanuts
    Bread

And params

Sandwich:
  - PBJ[
    Hungry
    ]

A lookahead can break on lines

PBJ: Bread [
  lookahead
  !
  Ketchup
  ] Bread

A lookahead can break on lines with a set

PBJ: Bread [
  lookahead
  !
  {
  Ketchup,
  Mustard
  }
  ] Bread

Constraints breaking lines

PBJ: Bread
  Condiment
  but
  not
  one
  of
  Ketchup,
  Mustard
  Bread

# Algorithms

An algoritm can have no args

Algo():
  - Step

An algorithm can have multiple args

Algo(arg1, arg2, arg3):
  - Step

And can spread across multiple lines

Algo(
  arg1,
  arg2,
  arg3
):
  - Step

And omit commas

Algo(
  arg1
  arg2
  arg3
):
  - Step
