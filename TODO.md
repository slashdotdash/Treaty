# TODO

## Retract rules

Facts already asserted into the working memory can be retracted using the FactHandle.

## Conflict resolution

Implement one or more of the following resolution strategies.

* Salience
* Recency
* Primacy
* Fifo
* Lifo
* Complexity
* Simplicity
* LoadOrder
* Random

Resolution strategies are chained together; so that when a conflict resolver has two equal Activations the next conlict resolver the chain will try to decide. CompositeConflictResolver is used and takes an array of ConflictResolvers as it's constructor.

### Salience

Each rule has a salience attribute that can be assigned an Integer number, defaults to zero, the Integer and can be negative or positive.

Salience is a form of priority where rules with higher salience values are given higher priority when ordered in the activation queue. When a conflict occurs, i.e. more than one matching salience value for the current activation, then a sublist of those conflicts is returned.

### Recency

Recency looks at the counter assigned to each Fact in an Activation. Activations with the highest counter are placed at the top of the Agenda

### Primacy

Primacy looks at the counter assigned to each Fact in an Activation. Activations with the lowest counter are placed at the top of the Agenda

### Fifo

A depth based strategy dictacted by the order of activation. New Activations are placed on the top of the agenda. Due to each Activation creation being given a unique number conflicts will not occur for this strategy.

### Lifo

A breadth based strategy dictacted by the order of activation. New Activations are placed on the bottom of the agenda. Due to each Activation creation being given a unique number conflicts will not occur for this strategy.

### Complexity

This is a specifity based strategy and takes into account the complexity of the conflicting rules. The more complex the rule, ie the more conditions it has, the more specific it is - the number of parameters is not taken into account. Activations with a higher specifity are placed at the top of the Agenda.

### Simplicity

This is a specifity based strategy and takes into account the simplicity of the conflicting rules. The more simple the rule, ie the less conditions it has, the less specific it is - the number of parameters is not taken into account. Activations with a lower specifity are placed at the top of the Agenda.

### LoadOrder

As each rule is added to a ruleset it is given a loadOrder number; this can be used to "arbitrarily" resolve conflicts. Rules with a higher loadOrder number are placed at the top of the Agenda. As each number is unique conflicts will not occur for this strategy. This rule is semamtic module implementation based and should not be consider a "constant"; as semantic modules are updated loadOrder may change.

### Random

Activations are randomly inserted into the Agenda;

http://legacy.drools.codehaus.org/Conflict+Resolution

## Observer pattern for events

* After an object is asserted, modified or retracted.
* After each condition check
* After an Activation creation and cancellation
* After a consequence is executed.

	workingMemory.addEventListener(new DebugWorkingMemoryEventListener());
	agenda.addEventListener(new DebugWorkingMemoryEventListener());
	
http://legacy.drools.codehaus.org/Event+Model