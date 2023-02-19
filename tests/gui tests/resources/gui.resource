*** Settings ***
Documentation     		Custom keywords for GUI tests
Library           		OperatingSystem
Library					BuiltIn
Library					Process
Library					SeleniumLibrary


*** Variables ***
${JS-file}				app.js
${JS-path}				./../../${JS-file}

${browser}        		chrome
${noWebsite}			about:blank
${website}        		http://localhost:3000/



*** Keywords ***	
Run App
	OperatingSystem.File Should Exist		${JS-path}
	Start Process		node	${JS-path}	alias=run-node
	${version} = 	Wait For Process	run-node
	${result} = 	Get Process Result	run-node
	Log		${result}	console=yes
	Log		${version.stdout}	console=yes
	Is Process Running		run-node
	
Start Website
    Open Browser		${noWebsite}		${browser}
	Go To				${website}
	