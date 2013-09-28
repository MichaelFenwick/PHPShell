<?php

session_start();
if (!isset($_SESSION['pwd'])) {
	$_SESSION['pwd'] = getcwd();
}
chdir($_SESSION['pwd']);

$inputs = isset($_POST['input']) ? array($_POST['input']) : null;
$historySize = isset($_POST['history']) ? array($_POST['history']) : null;

$outputs = array();
$history = array();

if ($inputs) {
	$_SESSION['history'] = array_merge($_SESSION['history'] ? $_SESSION['history'] : array(), array_filter($inputs));
	switch (true) {
		/** @noinspection PhpMissingBreakStatementInspection */
		case preg_match("/^cd\\s+(.*)$/", $inputs[0], $matches):
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
}

if ($historySize) {
	$history = array_slice($_SESSION['history'], is_numeric($historySize) ? -1 * $historySize : null, null, true);
}

echo json_encode(array(
	"pwd"     => $_SESSION['pwd'],
	"outputs" => $outputs,
	"history" => $history
));

function runExec($inputs) {
	$outputs = array();
	foreach ($inputs as $input) {
		exec($input, $output);
		$outputs[] = array_map(function ($line) {
			return htmlspecialchars($line);
		}, $output);
	}

	return $outputs;
}

