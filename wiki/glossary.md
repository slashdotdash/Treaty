# Rete Algorithm

Rete algorithm is a well known algorithm for efficiently addressing the many patterns/many objects match pattern.

Rete is usually pronounced as two syllables, e.g. REH-te or RAY-tay.

The Rete algorithm, developed by Charles Forgy in 1974, forms the brain of a Production Rule System and is able to scale to a large number of rules and facts.

## Business Rule
An important class of rule based languages is based on the notion of a production rule, which is a statement of the form "if condition then action".

## Rule-based or Production System
A rule-based system consists of a number of components:

* Collection of rules (also called a knowledge base)
* Collection of facts
* An interpreter, or inference engine

An implementation of a production system consists mainly of the following five components.

### Fact Types
User defined datatypes with fields and properties.
Intended for organising the data to be manipulated.

### Working Memory (WM)
Current program state, a global structure of facts.
The collection of facts represents inputs to the system that are used to derive conclusions, or to cause actions.

### Production Rules
Conditional statements of the form
    
    [Name] if Condition then Action
	[Name] when <condition(s)> then <action(s)>

A rule has a name and acts by addition and retraction of facts on the WM if the condition is fulfilled.

Condition is usually called the left hand side (LHS) or the production rule.
* May or may not be satisfied by the WM.
* When the LHS is satisfied, the rule is said be to _activated_. 

Action is called the right hand side (RHS).

### Production Memory or Knowledge Base
A structure of production rules, also know as Knowledge Base. 
Represents the specific domain knowledge that the system has.
Almost always unvarying.

### Resolution Strategy
An algorithm for selecting just one rule to execute, if the conditions of the LHS of more than one rule are satisfied at the same time.

### Interpreter or Inference Engine
Part of the system that controls the process of deriving conclusions. It uses the rules and facts, and combines them together to draw conclusions.

Conclusions are often derived using deduction, although there are other possible approaches. 

Using deduction to reach a conclusion from a set of antecedents is called forward chaining. 

An alternative method, backward chaining, starts from a conclusion and tries to show it by following a logical path backward from the conclusion to a set of antecedents that are in the database of facts.

### Explanation System (Optional)
Provides information to the user about how the inference engine arrived at its conclusions.


## Process

1. (Pattern) Matching
   Evaluate the LHS of each rule to determine which ones to activate.

2. Conflict resolution or selection
3. Firing or act
4. Goto step 1

## Rules
	IF A THEN B
	A => B

A = Antecedent
B = Consequent

Rule may have more than one antecedennt, usually combined eithr by AND or by OR.
Rule may have more than one consequent, which usually suggests that there are multiple actions to be taken.

In general, the antecedent of a rule compares an object with a possible value, using an operator. For example, suitable antecedents in a rule might be.

	IF x > 3
	IF name is "Bob"
	IF weather is cold

### Example Rule
This is an example of a recommendation rule, which takes a set of inputs
and gives advice as a result.

	IF name is "Bob"
	AND weather is cold
	THEN tell Bob ‘Wear a coat’

Rules can also be used to represent relations such as:

	IF temperature is below 0
	THEN weather is cold
	
## Hybrid Reasoning System