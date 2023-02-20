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

### Tests
The tests are split into GUI and DB tests.
Among DB tests there are:
- AddUsers.bat, which connects to the VM, connects to DB, adds six pre-defined users,
- Admin.bat, which connects to the VM, connects to DB, checks that an admin account with email admin@d0018e.com and password 'password' exists,
- ConnectToDB.bat, which connects to the VM and to the DB,
- Procedures.bat, which connects to the VM, connects to DB, calls the procedure to create new user and creates a new user,
- Tables.bat, which connects to the VM, connects to DB and checks if all tables exist,
- UpdateDB.bat, which connects to the VM, connects DB, uploads the db.sql found in repository to the VM and runs it,
- UserBasketRefusal.bat, which connects to the VM, connects to DB, tries to remove the six previously added users but expects not to be able to, since according to the database's structure, a shopping basket is automatically created upon creation of user, therefore in order to delete a user, first the shopping basket must be removed,
