# D0018E

## App
In order to successfully load the page, one must connect to the VM on DUST first in a separate terminal window by running `ssh -p 26880 karruc-9@130.240.207.20 -L 33306:localhost:3306` and then proceed to run `node app.js`


## Tests

### Requirements
All tests are written using [Robot Framework](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html).
Note that in order to run the tests you must have installed:
- Python 3
- PIP
- Robot Framework
  - [Selenium Library](https://github.com/robotframework/SeleniumLibrary)
  - [Database Library](https://franz-see.github.io/Robotframework-Database-Library/api/1.2.2/DatabaseLibrary.html)
  - [SSH Library](http://robotframework.org/SSHLibrary/SSHLibrary.html)
- [pymysql](https://pypi.org/project/PyMySQL/)

### How to run
In order to run a single test, double click the bat file related to it.
