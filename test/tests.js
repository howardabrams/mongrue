var url = "/unicorn";

$.ajaxSetup({
    headers: {
        'x-mongrue-clientkey': 'dsk38dslgkhsgtsl'
    }
});


$(document).ready(function(){  
    module("Mongrue sanity tests");

    asyncTest("Create a 'unicorn' entry", 10, function() {
	var daisy = {
	    name : "Daisy",
	    dob: new Date(1992, 10, 2, 13, 0), 
	    loves: ["candy", "grape"], 
	    weight: 650, 
	    gender: 'f', 
	    vampires: 3
	};

	console.log("Let's get this test started, shall we?");
	stop(3000);

	$.ajax({
	    type: 'POST',
	    url: url,
	    data: JSON.stringify(daisy),
	    contentType: 'application/json',
	    dataType: 'json',
	    error: errorHandler,
	    success: function(results, textStatus) {
		console.log("Created a unicorn: " + results.name);
		// Can't do a deepEqual since the results has an extra _id field:
		equal(results.name,      daisy.name,     "The unicorn 'name' field matches what we expected.");
		deepEqual(new Date(results.dob),   daisy.dob,      "The unicorn 'dob' field matches what we expected.");
		deepEqual(results.loves, daisy.loves,    "The unicorn 'loves' field matches what we expected.");
		equal(results.weight,    daisy.weight,   "The unicorn 'weight' field matches what we expected.");
		equal(results.gender,    daisy.gender,   "The unicorn 'gender' field matches what we expected.");
		equal(results.vampires,  daisy.vampires, "The unicorn 'vampire' field matches what we expected.");
		var urlid = url + "/" + results._id;

		$.getJSON(urlid, function(details) {
		    console.log("Read our unicorn: " + details.name);
		    deepEqual(details, results, "Read our unicorn");

		    daisy.name = "Derek";
		    daisy.gender = "m";

		    $.ajax({
			type: 'PUT',
			url: urlid,
			data: JSON.stringify(daisy),
			contentType: 'application/json',
			dataType: 'json',
			error: errorHandler,
			success: function(oldDerek) {
			    console.log("Changed our unicorn: " + oldDerek.name);
			    $.getJSON(urlid, function(derek) {
				console.log("Read our new unicorn: " + derek.name);
				equal(derek.name, daisy.name, "Changed our unicorn a bit");
				equal(derek.gender, daisy.gender, "Changed our unicorn just a bit");
				equal(derek.weight, daisy.weight, "Didn't change his weight, tho");
				start();
			    });
			}
		    });

		});
	    }
	});
    });

    asyncTest("Upsert a 'unicorn' entry", 3, function() {
	var id = "4e5d0dd3750f46281403001a";
	var duncan = {
	    name : "Duncan",
	    dob: "1993-06-03T19:00:00.000Z", // new Date(1993, 5, 3, 12, 0), 
	    loves: ["brocolli", "spinach"], 
	    weight: 460, 
	    gender: 'm', 
	    vampires: 23
	};
	var urlid = url + "/" + id;

	    stop(3000);

	var upsertTest = function() {
	    console.log("Should we stop here?");
	    $.ajax({
		type: 'POST',
		url: urlid,
		data: JSON.stringify(duncan),
		contentType: 'application/json',
		error: errorHandler,
		success: function(results, textStatus) {
		    console.log("Created a specific 'Duncan' unicorn.");
		    equal(results, "OK", "The unicorn 'duncan' matches what we expected.");

		    // Let's post a second time, and make sure we can change something.
		    duncan.weight = 630;

		    $.ajax({
			type: 'POST',
			url: urlid,
			data: JSON.stringify(duncan),
			contentType: 'application/json',
			error: errorHandler,
			success: function(results, textStatus) {
			    console.log("Updated a specific 'Duncan' unicorn.");
			    equal(results, "OK", "The unicorn 'duncan' was updated.");

			    $.getJSON(urlid, function(details) {
				console.log("Read our unicorn: ", details);
				duncan._id = id;
				deepEqual(details, duncan, "Our updated unicorn matches.");
				start();
			    });
			}
		    });
		}
	    });
	};

	console.log("Time to make sure the unicorn doesn't exist.");

	$.ajax({
	    type: 'DELETE',
	    url: urlid,
	    error: upsertTest,
	    success: upsertTest
	});
    });


    module("Mongrue complete tests");

    asyncTest("Get a list of unicorns", 4, function() {
	stop();

	setupUnicorns( function() {
	    var counter = 4;
	    function done() { --counter || start(); }

	    var numUnicorns = 0;
	    
    	    $.getJSON(url, function(unicorns) {
		console.log("Looks like we have " + unicorns.length + " unicorns in the database.");
		
		$.getJSON(url + "?sort=name", function(results) {
		    equal(results[0].name, "Aurora", "Aurora is first, so we assume the unicorns were sorted.");
		    done();
		});
		
		$.getJSON(url + "?limit=4", function(results) {
		    equal(results.length, 4, "We received 4 unicorns when given the limit parameter.");
		    done();
		});
		
		var expectedTotal = 4;
		var offset = unicorns.length - expectedTotal;
		$.getJSON(url + "?skip="+offset, function(results) {
		    console.log(results);
		    equal(results.length, expectedTotal, "We received 4 unicorns when skipping " + offset + " unicorns.");
		    done();
		});
		
		$.getJSON(url + "?sort=name&skip=4", function(results) {
		    console.log(results);
		    equal(results[0].name, "Kenny", "Kenny is first, so we assume the offset parameter with sorting worked.");
		    done();
		});
	    });
    	});
    });

    module("Mongrue negative/security testsing");

    asyncTest("Make sure that we can not access squirrels", 1, function() {
	stop(2000);

	$.ajax({
	    type: 'POST',
	    url: '/squirrel',
	    data: JSON.stringify( {name:"Rocky"} ),
	    contentType: 'application/json',
	    error: function errorHandler(jqXHR, textStatus, errorThrown) {
		equal(400, jqXHR.status, "Good, we couldn't store a squirrel.");
		start();
	    },
	    success: function(results, textStatus) {
		console.log("Updated a specific 'Duncan' unicorn.");
		ok(false, "We were able to store a squirrel.");
		start();
	    }
	});
    });
});

function setupUnicorns(finalCallback)
{
    console.log("Setting up the database to have only specific unicorns.");
    $.getJSON(url, function(unicorns) {
	if (unicorns.length > 0) {
	    console.log("Got a list of unicorns to remove.");
	    // console.log(unicorns);
	    deleteUnicorn(unicorns, finalCallback);
	}
	else {
	    addUnicorns(finalCallback);
	}
    });
}

function deleteUnicorn(unicorns, finalCallback) {
    if (unicorns && unicorns.length > 0) {
	var unicorn = unicorns[0];
	// console.log(unicorn);
	console.log("Deleting: "+ unicorn.name + " (" + unicorn._id + ")" );
	$.ajax({
	    type: 'DELETE',
	    url: url + "/" + unicorn._id,
	    success: function() {
		unicorns.shift();
		deleteUnicorn( unicorns, finalCallback );
	    }
	});
    }
    else {
	console.log("We have deleted all of the unicorns.");
	addUnicorns(finalCallback);
    }
}
    
function addUnicorns(finalCallback)
{
   var unicorns = [
       {
	   name: 'Horny', 
	   dob: new Date(1992,2,13,7,47), 
	   loves: ['carrot','papaya'], 
	   weight: 600, 
	   gender: 'm', 
	   vampires: 63
       },
       {
	   name: 'Aurora', 
	   dob: new Date(1991, 0, 24, 13, 0), 
	   loves: ['carrot', 'grape'], 
	   weight: 450, 
	   gender: 'f', 
	   vampires: 43
       },
       {
	   name: 'Unicrom', 
	   dob: new Date(1973, 1, 9, 22, 10), 
	   loves: ['energon', 'redbull'], 
	   weight: 984, 
	   gender: 'm', 
	   vampires: 182
       },
       {
	   name: 'Roooooodles', 
	   dob: new Date(1979, 7, 18, 18, 44),
	   loves: ['apple'], 
	   weight: 575, 
	   gender: 'm', 
	   vampires: 99
       },
       {
	   name: 'Solnara', 
	   dob: new Date(1985, 6, 4, 2, 1), 
	   loves: ['apple', 'carrot', 'chocolate'], 
	   weight:550, 
	   gender:'f', 
	   vampires:80
       },
       {
	   name:'Ayna', 
	   dob: new Date(1998, 2, 7, 8, 30), 
	   loves: ['strawberry', 'lemon'], 
	   weight: 733, 
	   gender: 'f', 
	   vampires: 40
       },
       {
	   name:'Kenny', 
	   dob: new Date(1997, 6, 1, 10, 42), 
	   loves: ['grape', 'lemon'], 
	   weight: 690, 
	   gender: 'm', 
	   vampires: 39
       },
       {
	   name: 'Raleigh', 
	   dob: new Date(2005, 4, 3, 0, 57), 
	   loves: ['apple', 'sugar'], 
	   weight: 421, 
	   gender: 'm', 
	   vampires: 2
       },
       {
	   name: 'Leia', 
	   dob: new Date(2001, 9, 8, 14, 53), 
	   loves: ['apple', 'watermelon'], 
	   weight: 601, 
	   gender: 'f', 
	   vampires: 33
       },
       {
	   name: 'Pilot', 
	   dob: new Date(1997, 2, 1, 5, 3), 
	   loves: ['apple', 'watermelon'], 
	   weight: 650, 
	   gender: 'm', 
	   vampires: 54
       },
       {
	   name: 'Nimue', 
	   dob: new Date(1999, 11, 20, 16, 15), 
	   loves: ['grape', 'carrot'], 
	   weight: 540, 
	   gender: 'f'
       },
       {
	   name: 'Dunx', 
	   dob: new Date(1976, 6, 18, 18, 18), 
	   loves: ['grape', 'watermelon'], 
	   weight: 704, 
	   gender: 'm', 
	   vampires: 165
       }
   ];
    console.log("Entering " + unicorns.length + " unicorns.");
    addUnicorn(unicorns, finalCallback);
}

function addUnicorn(unicorns, finalCallback) {
    if (unicorns && unicorns.length > 0) {
	var unicorn = unicorns[0];
	console.log("Adding: "+ unicorn.name);
	$.ajax({
	    type: 'POST',
	    url: url,
	    data: JSON.stringify(unicorn),
	    contentType: 'application/json',
	    success: function() {
		unicorns.shift();
		addUnicorn( unicorns, finalCallback );
	    }
	});
    }
    else {
	finalCallback();
    }
}

function errorHandler(jqXHR, textStatus, errorThrown) {
    console.log("Test failed due to an AJAX error: " + jqXHR.responseText);
    ok(false, jqXHR.status + ": " + jqXHR.responseText);
    start();
}