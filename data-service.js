const fs = require("fs");

let students = [];
let programs = [];
let Images = [];

module.exports.addImage = function(imageUrl) {
    return new Promise((resolve, reject) => {
      Images.push(imageUrl);
      resolve(Images);
    });
  }

module.exports.getImages = function() {
    return new Promise((resolve, reject) => {
      if (Images.length === 0) {
        reject("no results returned");
      } else {
        resolve(Images);
      }
    });
}

module.exports.addStudent = function(studentData) {
    return new Promise((resolve, reject) => {
      // If isInternationalStudent is undefined, set it to false
      if (studentData.isInternationalStudent === undefined) {
        studentData.isInternationalStudent = false;
      } else {
        studentData.isInternationalStudent = true;
      }
  
      // Generate student ID
      let students = require("./data/students.json");
      let studentIDs = students.map(student => parseInt(student.studentID));
      let maxID = Math.max(...studentIDs);
      let newID = (maxID + 1).toString();
      studentData.studentID = newID;
  
      // Add the new student to the list of students
      students.push(studentData);
  
      // Write the updated students list back to the JSON file
      fs.writeFile("./data/students.json", JSON.stringify(students), function(err) {
        if (err) {
          reject("Error adding student");
        } else {
          resolve();
        }
      });
    });
};

module.exports.getStudentsByProgramCode = function(programCode) {
    return new Promise((resolve, reject) => {
      const filteredStudents = students.filter(student => student.program === programCode);
      if (filteredStudents.length === 0) {
        reject("no results returned");
      } else {
        resolve(filteredStudents);
      }
    });
}

module.exports.getStudentsByExpectedCredential = function(credential) {
    return new Promise((resolve, reject) => {
      const filteredStudents = students.filter(student => student.expectedCredential === credential);
  
      if (filteredStudents.length === 0) {
        reject(`No results returned for expectedCredential: ${credential}`);
      } else {
        resolve(filteredStudents);
      }
    });
}

module.exports.getStudentById = function(sid) {
    return new Promise((resolve, reject) => {
      const student = students.find(s => s.studentId === sid);
      if (student) {
        resolve(student);
      } else {
        reject("no result returned");
      }
    });
  }

module.exports.getStudentsByStatus = function(status) {
    return new Promise((resolve, reject) => {
      const filteredStudents = students.filter(student => student.status === status);
      if (filteredStudents.length > 0) {
        resolve(filteredStudents);
      } else {
        reject(`No students found with status: ${status}`);
      }
    });
};

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        fs.readFile('./data/programs.json','utf8', (err, data) => {
            if (err) {
                reject(err); return;
            }

            programs = JSON.parse(data);
            // programs = require('./data/programs.json');

            fs.readFile('./data/students.json','utf8', (err, data) => {
                if (err) {
                    reject(err); return;
                }

                students = JSON.parse(data);
                // students = require('./data/students.json');
                resolve();
            });
        });
    });
}

module.exports.getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        if (students.length == 0) {
            reject("query returned 0 results"); return;
        }

        resolve(students);
    })
}

module.exports.getInternationalStudents = function () {
    return new Promise(function (resolve, reject) {
        // var filteredStudents = [];

        // for (let i = 0; i < students.length; i++) {
        //     if (students[i].isInternationalStudent) {
        //         filteredStudents.push(students[i]);
        //     }
        // }

        // if (filteredStudents.length == 0) {
        //     reject("query returned 0 results"); return;
        // }

        // resolve(filteredStudents);

        (students.length > 0) ? resolve(students.filter(s => s.isInternationalStudent)) : reject("no results returned");
    });
};

module.exports.getPrograms = function(){
   return new Promise((resolve,reject)=>{
    if (programs.length == 0) {
        reject("query returned 0 results"); return;
    }

    resolve(programs);
   });
}
