var history = [];
var historyHashMap = [];

$(document).ready(function () {
	getHistory();

	$("#input").on("keypress", function (e) {
		var input = $(this).val();
		if ((e.keyCode ? e.keyCode : e.which) == 13) {
			$.ajax({
				url:      "exec.php",
				data:     {input: input},
				dataType: "json",
				type:     "POST",
				success:  function (data) {
					//clear the input prompt for the next command.
					$("#input").val("");

					postOutput(data.outputs);
					setPrompt(data.pwd + " >> ");
					pushHistory(input);
				},
				failure:  function (data) {
					postOutput(["<span class='error'>An error occurred.  Please check the javascript console and XHR responses.</span>"]);
					console.log("error");
					console.log(data);
				}
			});
		}
	});
});

function postOutput(outputs) {
	//add the new output to the output window.
	$.each(outputs, function (lineNumber, outputLine) {
		if (outputLine) {
			$("#output").append("<pre class='entry'>" + outputLine.join('\n') + "</pre>");
		}
	});

	//scroll the output window to the bottom.
	$("#output").animate({scrollTop: $('#output')[0].scrollHeight}, 400);
}

function setPrompt(prompt) {
	$("#prompt").html(prompt);
}

function getHistory(size) {
	$.ajax({
		url:      "exec.php",
		data:     {history: size || null},
		dataType: "json",
		type:     "POST",
		success:  function (data) {
			for (var i in data.history) {
				if (data.history.hasOwnProperty(i)) {
					pushHistory(data.history[i], i);
				}
			}
		},
		failure:  function (data) {
			postOutput(["<span class='error'>An error occurred.  Please check the javascript console and XHR responses.</span>"]);
			console.log("error");
			console.log(data);
		}
	});
}

function pushHistory(historyItem, id) {
	if (historyItem) {
		if (id !== undefined) {
			history[id] = historyItem;
		} else {
			history.push(historyItem);
		}

		addHistoryHash(historyHashMap, historyItem.split(''));
	}
}

//This is a pretty messy recursive function that really could (should) be rewritten.  It can act in two ways.  First it recurs from the top down the historyHashMap until it finds a missing key (adding one to the count as it goes).  When it reaches an undefined key, it will then recur from the bottom up to build the missing part of the map, which then gets returned and assigned where the missing key was.  The existence of a historyHashRef var or not is what signals whether it's in top down or bottom up mode.
function addHistoryHash(historyHashRef, array) {
	var nextChar;
	var newObj = {};

	if (!array.length) {
		if (historyHashRef) {
			historyHashRef.end += 1;
		}
		return {end: 1, count: 1};
	}

	nextChar = array.shift();
	array = array.slice(0);
	if (historyHashRef == null) {
		newObj[nextChar] = addHistoryHash(null, array);
		newObj.count = 1;
		return newObj;
	}

	if (typeof historyHashRef[nextChar] !== "undefined") {
		addHistoryHash(historyHashRef[nextChar], array);
		historyHashRef[nextChar].count += 1;
	} else {
		historyHashRef[nextChar] = addHistoryHash(null, array);
	}
}