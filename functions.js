$(document).ready(function () {
	$("#prompt").on("keypress", function(e) {
		if((e.keyCode ? e.keyCode : e.which) == 13) {
			$.ajax({
				url: "exec.php",
				data: {input: $(this).val()},
				dataType: "json",
				type: "POST",
				success: function(data) {
					//clear the input prompt for the next command.
					$("#prompt").val("");

					//add the new output to the output window.
					console.log(data);
					$.each(data, function(lineNumber, outputLine) {
						if (outputLine) {
							$("#output").append("<pre class='entry'>"+outputLine.join('\n')+"</pre>");
						}
					});

					//scroll the output window to the bottom.
					$("#output").animate({scrollTop: $('#output')[0].scrollHeight}, 400);
				},
				failure: function(data) {
					console.log("error");
					console.log(data);
				}
			});
		}
	});
});