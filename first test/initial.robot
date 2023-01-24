*** Settings ***
Documentation     		Initial test
Library           		SeleniumLibrary 

*** Variables ***
${browser}        		chrome
${noWebsite}			about:blank
${website}        		https://www.ahlens.se/

*** Test Cases ***
Test Ahlens
    Open Browser		${noWebsite}		${browser}
	Sleep				5
	Go To				${website}
	Sleep				5
