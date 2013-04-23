<!DOCTYPE html>
<!--[if IE 7 ]><html lang="en" class="ie7 nojs"><![endif]-->
<!--[if IE 8 ]><html lang="en" class="ie8 nojs"><![endif]-->
<!--[if IE 9 ]><html lang="en" class="ie9 nojs"><![endif]-->
<!--[if gt IE 9]><!--><html lang="en" class="nojs"><!--<![endif]-->
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="keywords" content="" />
		<meta name="description" content="" />

		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />

		<title>InDaLab</title>

		<script>document.documentElement.className = document.documentElement.className.replace('nojs', '');</script>
		<link rel="stylesheet" href="stylesheets/reset.css" />
		<link rel="stylesheet" href="stylesheets/app.css" />

	</head>
	<body class="preload">
		<div id="section_main">
			<noscript>
				<p>Javascript is currently disabled. Please <a href="http://www.google.com/support/bin/answer.py?answer=23852" target="_blank">enable javascript</a> for the optimal experience!</p>
			</noscript>

			<div id="header_global">
				<h1>InDaLab</h2>
				<h2>RIT New Media Lab (BOO-1303)</h2>
			</div>


			<div id="templates">
				<div class="signIn">
					<h2>Claim A Computer</h2>
					<div class="content">
						<p>What's your name, dawg?</p>
						<form>
							<input type="text" placeholder="New Meteor" id="signin_name" name="signin_name"></input>
							<div class="buttons">
								<a href="#" class="close">Cancel</a>
								<a href="#" class="submit">Submit</a>
							</div>
						</form>
					</div>
				</div>

				<div class="detected">
					<h2>Welcome to the Lab!</h2>
					<div class="content">
						<p>It looks like you're on a computer in the lab. Would you like to claim it?</p>
						<p style="margin-top:15px;">Enter your name below.</p>
						<form>
							<input type="text" placeholder="New Meteor" id="confirmed_name" name="signin_name"></input>
							<div class="buttons">
								<a href="#" class="close">Naw I'm good</a>
								<a href="#" class="submit">Submit</a>
							</div>
						</form>
					</div>
				</div>
			</div>

			<div id="section_content">
				<div id="ohhey">
					<h2>Oh hey</h2>
					<p>this is where information or content would go. lol right?</p>
					<p style="margin-top: 10px;">more content</p>
					<div class="buttons">
						<a href="#" class="close">Close</a>
					</div>
				</div>
				<div id="section_users">
					<ul id="northWest">
						<li data-computer-id="1"><div class="name">NW Comp 1</div></li>
						<li data-computer-id="2"><div class="name">Comp 2</div></li>
						<li data-computer-id="3"><div class="name">Comp 3</div></li>
						<li data-computer-id="4"><div class="name">Comp 4</div></li>
						<li data-computer-id="5"><div class="name">Comp 5</div></li>
						<li data-computer-id="6"><div class="name">Comp 6</div></li>
					</ul>
					<ul id="northEast">
						<ul data-special="instructor">
							<li data-computer-id="7"><div class="name">Instructor</div></li>
						</ul>
						<li data-computer-id="8"><div class="name">NE Comp 7</div></li>
						<li data-computer-id="9"><div class="name">Comp 8</div></li>
						<li data-computer-id="10"><div class="name">Comp 9</div></li>
						<li data-computer-id="11"><div class="name">Comp 10</div></li>
						<li data-computer-id="12"><div class="name">Comp 11</div></li>
						<li data-computer-id="13"><div class="name">Comp 12</div></li>
					</ul>
					<ul id="southWest">
						<li data-computer-id="14"><div class="name">SW Comp 13</div></li>
						<li data-computer-id="15"><div class="name">Comp 14</div></li>
						<li data-computer-id="16"><div class="name">Comp 15</div></li>
						<li data-computer-id="17"><div class="name">Comp 16</div></li>
						<li data-computer-id="18"><div class="name">Comp 17 (Cintiq)</div></li>
						<li data-computer-id="19"><div class="name">Comp 18 (Cintiq)</div></li>
					</ul>

					<ul id="southEast">
						<li data-computer-id="20"><div class="name">SE Comp 19</div></li>
						<li data-computer-id="21"><div class="name">Comp 20</div></li>
						<li data-computer-id="22"><div class="name">Comp 21</div></li>
						<li data-computer-id="23"><div class="name">Comp 22</div></li>
						<li data-computer-id="24"><div class="name">Comp 23 (Cintiq)</div></li>
						<li data-computer-id="25"><div class="name">Comp 24 (Cintiq)</div></li>
					</ul>

					<div id="others">
						<ul id="spaceShuttle" data-special="shuttle">
							<li data-computer-id="26"><div class="name">Shuttle</div></li>
						</ul>

						<ul id="labby" data-special="labby">
							<li data-computer-id="27"><div class="name">Labby</div></li>
						</ul>
					</div>

					<ul id="southWestCouch" class="couch">
						<li data-computer-id="28"><div class="name">One</div></li>
						<li data-computer-id="29"><div class="name">Two</div></li>
						<li data-computer-id="30"><div class="name">Three</div></li>
					</ul>

					<ul id="southEastCouch" class="couch">
						<li data-computer-id="31"><div class="name">One</div></li>
						<li data-computer-id="32"><div class="name">Two</div></li>
						<li data-computer-id="33"><div class="name">Three</div></li>
					</ul>
					<ul class="couch loveseat">
						<!-- Other Couch -->
						<li data-computer-id="34"><div class="name">One</div></li>
						<li data-computer-id="35"><div class="name">Two</div></li>
						<!-- <li data-computer-id="36"><div class="name">Three</div></li> -->
					</ul>

						<!-- Other Couch -->
					<ul class="couch">
						<li data-computer-id="37"><div class="name">One</div></li>
						<li data-computer-id="38"><div class="name">Two</div></li>
						<li data-computer-id="39"><div class="name">Three</div></li>
					</ul>
				</div>
				<div id="section_chat">
					<h2>Chetroom</h2>
					<div>
						<div id="tlkio" data-channel="ritnmlab"></div><script async src="http://tlk.io/embed.js" type="text/javascript"></script>
					</div>
				</div>
			</div>
			<div id="footer_global"></div>
		</div>
		
		<script src="//code.jquery.com/jquery-1.8.3.min.js"></script>
		<?php
			$hostname = gethostbyaddr($_SERVER['REMOTE_ADDR']);
			echo("<script>window.detectedName = '" . $hostname . "';</script>");
		?>
		<script src="site.js"></script>
	</body>
</html>
