*** Settings ***
Documentation     		Custom keywords for VM tests
Library           		SSHLibrary
Library					Dialogs


*** Variables ***
# SSH credentials, move to cfg file
${SSHHost}		130.240.207.20
${SSHPort}		26880
${SSHUser}		karruc-9
${localPort}	33306
${remotePort}	3306 


*** Keywords ***	
Connect to VM
	Set Log Level    		NONE
	${SSHPassword} =		Get Value From User				SSH password:		hidden=yes
    Open Connection			${SSHHost}		port=${SSHPort}
	Login					${SSHUser}		${SSHPassword}
	Set Log Level    		TRACE
	Create Local Ssh Tunnel	${localPort}	${DBHost}		${remotePort}
	
Disconnect from VM
	Close All Connections
	