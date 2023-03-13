/**
 * Simply saves a file to the img folder
 */
const multer = require('multer');
const path = require('path');

function createUploadMiddleware(destination, filename) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      cb(null, filename || file.originalname);
    }
  });
  const upload = multer({ storage: storage });

  return upload.single('file');
}

module.exports = createUploadMiddleware;
// ...

// Define a route to handle image uploads
app.post('/upload-image', upload.single('image'), function (req, res, next) {
  const imageName = req.file.originalname;
  console.log(`Image "${imageName}" uploaded successfully!`);
  res.send('Image uploaded successfully!');
});

