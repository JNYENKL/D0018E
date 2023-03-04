const renderWithCats = (req, res, db, session, viewName, toRender = {}) => {
    const cats = [];

    db.SSHConnection().then(function (connection) {
      connection.query("SELECT subject_id, name FROM subject", function (err, row, fields) {
        if (err) {
          session.message = "Technical issues, check back later.";
          res.render("index", {
            message: session.message,
            cat: cats
          }, );
          //res.status(500).json({"status_code": 500,"status_message": "internal server error"+ err});
        } 
        else {          
        // Kolla igenom all data i tabellen
          for (var i = 0; i < row.length; i++) {
            const { subject_id, name } = row[i];
          
            var category = {
              subjectId: subject_id,
              catName: name,
            };
          //console.log('subject added:'+row[i].subject_id+', '+ row[i].name);
            cats.push(category);
          }

          console.log(toRender);

          res.render(viewName, {
            cat: cats,
            ...toRender
          });
        }
      }); 
    });
  };

  module.exports = {
    renderWithCats
  }