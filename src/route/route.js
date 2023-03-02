const { application } = require('express')
const express=require('express')
const router=express.Router()
const bookController=require("../controller/bookcontroller")
const userController=require("../controller/usercontroller")
const reviwesController = require("../controller/reviewscontroller")
const middleware = require("../middleware/middleware")




// ================= aws =====================================//

const aws= require("aws-sdk")

// s3 and cloud stodare
//  step1: multer will be used to get access to the file in nodejs( from previous session learnings)
//  step2:[BEST PRACTISE]:- always write s2 upload function separately- in a separate file/function..exptect it to take file as input and return the uploaded file as output
// step3: aws-sdk install - as package
// step4: Setupconfig for aws authenticcation- use code below as plugin keys that are given to you
//  step5: build the uploadFile funciton for uploading file- use code below and edit what is marked HERE only


//PROMISES:-
// -you can never use await on callback..if you awaited something , then you can be sure it is within a promise
// -how to write promise:- wrap your entire code inside: "return new Promise( function(resolve, reject) { "...and when error - return reject( err )..else when all ok and you have data, return resolve (data)

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

   

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        console.log("++++++++",files)
        if(files && files.length>0){
        
            let uploadedFileURL= await uploadFile( files[0] )
            console.log(uploadedFileURL)
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})








// ===============user api================//


router.post("/register",userController.createUser)
router.post("/login",userController.login)


// ============ book api =====================//
router.post("/books",middleware.authentication,middleware.authorization,bookController.createbooks)
router.get("/books",middleware.authentication,bookController.getbooks)
router.get("/books/:bookId",middleware.authentication,bookController.getBybookid)
router.put("/books/:bookId",middleware.authentication,middleware.authorization,bookController.updatebook)
router.delete("/books/:bookId",middleware.authentication,middleware.authorization,bookController.deleteBookById)

// =================== review=====================//
router.post("/books/:bookId/review",reviwesController.createReview)
router.put("/books/:bookId/review/:reviewId" ,reviwesController.updateReview)
router.delete("/books/:bookId/review/:reviewId" ,reviwesController.deleterive)




router.all('/*',function(req,res){
    return res.status(400).send({status:false, message:"pls provide valid path"})
})

module.exports=router