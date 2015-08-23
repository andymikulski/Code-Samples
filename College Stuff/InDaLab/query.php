<?php

// Connects the back end to the front end
// In this case, handles flat file stuff in the database

$dbDir = realpath( dirname( __FILE__ ) ) . "/db/";
chmod($dbDir,0755);

switch($_REQUEST['a']){
	case 'signIn':
		$id = intval($_REQUEST['id']);
		$computerInfo = array("id" => $id,
				"name" => $_REQUEST['name']);
			  // status stuff could go here
              // "age" => 20,
              // "and_one" => "more");

		file_put_contents($dbDir.$id,serialize($computerInfo));
		break;

	case 'countLoggedIn':
	$count = 0;
		for($i = 0; $i < 39; $i++){
			$stuff = unserialize(file_get_contents($dbDir.$i));

			if($stuff != ''){
				$count++;
			}
		}
		echo $count;
		break;

	case 'getLoggedIn':
		$info = array();
		for($i = 0; $i < 39; $i++){
			$stuff = unserialize(file_get_contents($dbDir.$i));

			if($stuff != ''){
				$info[$i] = $stuff;
			}
		}

		echo json_encode($info);
		break;


	case 'signOut':
		$id = intval($_REQUEST['id']);

		// To save a history of log outs, uncomment
		// if (copy($dbDir . $id, "/db/out/" . $id . "_" . time())) {
		  unlink($dbDir . $id);
		// }
		break;
	default:
		echo "what is this";
		break;
}


?>