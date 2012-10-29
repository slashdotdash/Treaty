# Rule Examples

## Bus Pass Example With Inference and TMS

	rule "Infer Child" 
	when
		$p : Person( age < 16 )
	then
		insertLogical( new IsChild( $p ) )
	end

	rule "Infer Adult" 
	when
		$p : Person( age >= 16 )
	then
		insertLogical( new IsAdult( $p ) )
	end
	
	rule "Issue Child Bus Pass" 
	when
		$p : Person( )
		IsChild( person == $p )
	then
		insertLogical(new ChildBusPass( $p ) );
	end
	
	rule "Issue Adult Bus Pass" 
	when
		$p : Person( )
		IsAdult( person == $p )
	then
		insertLogical(new AdultBusPass( $p ) );
	end
	
	rule "Return ChildBusPass Request"
	when
		$p : Person( )
		not( ChildBusPass( person == $p ) )
	then
		requestChildBusPass( $p );
	end
	
	
	
	rule.named("Issue Adult Bus Pass")
		.when<Person>(p => IsAdult(p))
	    .then<Person>(p => insertLogical(new AdultBusPass(p));
 
	rule.named("Issue Adult Bus Pass")
		.when(instanceof(Person), p => IsAdult(p))
	    .then(p => insertLogical(new AdultBusPass(p));
