<?php
function getMessages(){
	$buffer = "";
	$fd = fopen("log.txt", 'r');
	if(!$fd) return false;
	while(!feof($fd))
		$buffer .= fgets($fd, 4096);
	fclose($fd);
	return json_decode($buffer, true);
}
function saveMessages($messages){
	$string = json_encode($messages);
	$fd = fopen("log.txt", 'w');
	if(!$fd) return false;
	fwrite($fd, $string);
	fclose($fd);
	return true;
}
$messages = getMessages();
if(!$messages) $messages = [];
if($_POST['text']){
	$message = [
		"id" => count($messages),
		"username" => $_POST['username'],
		"text" => $_POST['text'],
		"time" => time(),
	];
	$messages[] = $message;
	if(!saveMessages($messages)){
		die(json_encode([
			'response' => false, 
			'error' => [
				'code' => 1, 
				'description' => 'Невозможно сохранить сообщение',
			],
		]));
	}
	echo json_encode(['response' => $message]);
}else if($_POST['history']){
	$m = [];
	foreach ($messages as $message) {
		if($message['id'] > $_POST['history']){
			$m[] = $message;
		}
	}
	echo json_encode(['response' => $m, 'id' => $_POST['history']]);
}