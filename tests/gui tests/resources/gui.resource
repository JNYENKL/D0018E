*** Settings ***
Documentation     		Custom keywords for GUI tests
Library           		OperatingSystem
Library					BuiltIn
Library					Process
Library					SeleniumLibrary
Resource				./../db tests/resources/vm.resource
Resource				./../db tests/resources/db.resource


*** Variables ***
${JS-file}				app.js
${JS-path}				./../../${JS-file}

${browser}        		chrome
${noWebsite}			about:blank
${website}        		http://localhost:3000/
${mathbook}				matematik för nybörjare
${mathbook_elem}		//a[.="${mathbook}"]
${mathbook2}			Om ${mathbook}:

${title_xpath}			xpath = /html/body/div[2]/div/div[1]/h1
${price_xpath}			xpath = /html/body/div[2]/div/div[2]/div[2]/h2
${stock_xpath}			xpath = /html/body/div[2]/div/div[2]/div[2]/p
${add_button_xpath}		xpath = /html/body/div[2]/div/div[2]/div[2]/button
${desc_xpath}			xpath = /html/body/div[2]/div/div[3]/p[2]




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
	
Look For Matematik For Nyborjare
	Wait Until Page Contains		${mathbook}
	Click Element					${mathbook_elem}
	Wait Until Page Contains		${mathbook2}
	
Check Attributes with DB
	Table Must Exist				asset
	Wait Until Element Is Visible	${title_xpath}
	${titleDB}=						Query		select title from asset where asset_id = 1;
	Element Text Should Be			${title_xpath}			${titleDB[0][0]}
	
	Wait Until Element Is Visible	${price_xpath}
	${priceDB}=						Query		select price from asset where asset_id = 1;
	Element Text Should Be			${price_xpath}			${priceDB[0][0]}kr
	
	Wait Until Element Is Visible	${stock_xpath}
	${stockDB}=						Query		select amount from asset where asset_id = 1;
	Element Text Should Be			${stock_xpath}			I lager: ${stockDB[0][0]}
	
	Wait Until Element Is Visible	${add_button_xpath}
	
	Wait Until Element Is Visible	${desc_xpath}
	${descDB}=						Query		select description from asset where asset_id = 1;
	Element Text Should Be			${desc_xpath}			${descDB[0][0]}
