*** Settings ***
Documentation     		Connect in order to run and test the website
Resource				./resources/gui.resource
Resource				./../db tests/resources/vm.resource
Resource				./../db tests/resources/db.resource
Test Setup				Set Log Level		TRACE


*** Test Cases ***	
#Initialize Connection
#	[tags]				GUIConnection	
    #Connect to VM
	#Log 				\n\nConnection to VM established!		console=yes
	
Run Website
	[tags]				GUIConnection
	#Run App
	Start Website
	Sleep	10s
	
	
#Disconnect
#	[tags]				GUIConnection
	#Disconnect from VM