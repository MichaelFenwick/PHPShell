$(document).ready(function () {
	$("#input").on("keypress", function(e) {
		if((e.keyCode ? e.keyCode : e.which) == 13) {
			$.ajax({
				url: "exec.php",
				data: {input: $(this).val()},
				dataType: "json",
				type: "POST",
				success: function(data) {
					//clear the input prompt for the next command.
					$("#input").val("");

					postOutput(data.outputs);
					setPrompt(data.pwd + " >> ");
				},
				failure: function(data) {
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
	$.each(outputs, function(lineNumber, outputLine) {
		if (outputLine) {
			$("#output").append("<pre class='entry'>"+outputLine.join('\n')+"</pre>");
		}
	});

	//scroll the output window to the bottom.
	$("#output").animate({scrollTop: $('#output')[0].scrollHeight}, 400);
}

function setPrompt(prompt) {
	$("#prompt").html(prompt);
}