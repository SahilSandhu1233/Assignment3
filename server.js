/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sahil Sandhu     Student ID: 117526210      Date: 17th Feb 2023
*
*  Online (Cyclic) Link: https://calm-teal-mite-gear.cyclic.app/
*
********************************************************************************/ 

const express = require("express");
const path = require("path");
const data = require("./data-service.js");
const app = express();
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const upload = multer(); // no { storage: storage }

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dji9zj3yh',
    api_key: '329248886433447',
    api_secret: 'R-p9Ox5q09GYr5irzd_gW4bu15I',
    secure: true
});


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/students", (req,res) => {
    data.getAllStudents().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.send(err);
    });
});

app.get("/students/add", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/addStudent.html"));
});

app.get("/images/add", (req,res) => {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.get("/intlstudents", (req,res) => {
    data.getInternationalStudents().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.send(err);
    });
});

app.get("/programs", (req,res) => {
    data.getPrograms().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.send(err);
    });
});

app.get("/students", (req, res) => {
    const status = req.query.status;
    const program = req.query.program;
    const credential = req.query.credential;
    
    if (status) {
      data.getStudentsByStatus(status)
        .then((students) => res.json(students))
        .catch((err) => res.status(500).send("Error getting students by status"));
    } else if (program) {
      data.getStudentsByProgramCode(program)
        .then((students) => res.json(students))
        .catch((err) => res.status(500).send("Error getting students by program code"));
    } else if (credential) {
      data.getStudentsByExpectedCredential(credential)
        .then((students) => res.json(students))
        .catch((err) => res.status(500).send("Error getting students by expected credential"));
    } else {
      data.getAllStudents()
        .then((students) => res.json(students))
        .catch((err) => res.status(500).send("Error getting all students"));
    }
  });

  app.get('/students/:sid', (req, res) => {
    const sid = req.params.sid;
    data.getStudentById(sid)
      .then(student => {
        if (student) {
          res.json(student);
        } else {
          res.status(404).send("Student not found");
        }
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error getting student");
      });
  });

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processForm(uploaded.url);
        });
    }else{
        processForm("");
    }

    function processForm(imageUrl){
        
        app.get("/images", (req, res) => {
            // Get all images from Cloudinary
            cloudinary.api.resources((error, result) => {
              if (error) {
                console.error(error);
                res.status(500).send("Error getting images from Cloudinary");
              } else {
                const images = result.resources.map(resource => resource.url);
                res.json({ images });
              }
            });
          });
    }   
});

app.post("/students/add", (req, res) => {
    data.addStudent(req.body)
      .then(() => {
        res.redirect("/students");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error adding student.");
      });
  });

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

