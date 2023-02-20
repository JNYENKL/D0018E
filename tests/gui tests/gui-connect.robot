*** Settings ***
Documentation     		Connect in order to run and test the website
Resource				./resources/gui.resource
Test Setup				Set Log Level		TRACE


*** Test Cases ***
Initialize Connection
	[tags]				GUIConnection
	Disconnect from VM
    Connect to VM
	Log 				\n\nConnection to VM established!		console=yes
	Connect to DB
	Log					\nConnection to DB established!			console=yes
	
Run Website
	[tags]				GUIConnection
	#Run App
	Start Website
	Look For Matematik For Nyborjare
	Check Attributes with DB
	
	
#Disconnect
#	[tags]				GUIConnection
	#Disconnect from VM