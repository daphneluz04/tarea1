const User=require('../../database/collection/user');
const express=require('express');
const empty=require('is-empty');
const sha1=require('sha1');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const router=express.Router();
//GET
router.get('/',(req,res)=>{
    User.find({},(err,docs)=>{
        if(!empty(docs)){
            res.json(docs);

        }else{
            res.json({message:'no existen datos en la bd'});
        }

    });
});
//POST
router.post('/', async(req,res)=>{
    console.log(req.body);
    req.body.password=sha1 (req.body.password);
    let ins=new User(req.body);
    let result=await ins.save();
    if(!empty(result)){
        res.json({message:'usuario insertado en la bd'});

    }else{
        res.json({message:'hubo errores'});
    }

});
//PATCH
router.patch('/', (req, res) => {
    if (req.query.id == null) {
        res.status(300).json({
             msn: "Error no existe id"
        });
        return;
    }
    var id = req.query.id;
    var params = req.body;
    User.findOneAndUpdate({_id: id}, params, (err, docs) => {
         res.status(200).json(docs);
    });
});
//DELETE
router.delete('/', async(req, res) => {
    if (req.query.id == null) {
         res.status(300).json({
        msn: "Error no existe id"
        });
        return;
    }
    var r = await User.remove({_id: req.query.id});
    res.status(300).json(r);
});
//PUT
router.put('/', async(req,res)=>{
    var params = req.query;
    var bodydata = req.body;
    if(params.id == null){
        res.status(300).json({msn:"Id necesatio"});
        return;
    }
    var allowkeylist = ['nombre',"password","email",];
    var keys = Object.keys(bodydata);
    var updateobjectdata={};
    for(var i=0; i<keys.length;i++){
            if (allowkeylist.indexOf(keys[i]) > -1){
                updateobjectdata[keys[i]] = bodydata[keys[i]];
        }
    }
    User.update({_id: params.id},{$set:  updateobjectdata},(err,docs)=>{
        if(err){
            res.status(500).json({msn:"Existen problemas con la base de datos"});
            return;
        }
        res.status(200).json(docs);
    } );

});
//LOGIN
router.post("/login",(req,res)=>{
    User.findOne({email:req.body.email},(err,doc)=>{
        if(!empty(doc)){
            if(sha1(req.body.password)==doc.password){
                let token=jwt.sign({
                    id:doc._id,
                    email:doc.email
                },process.env.JWT_Key||'miClave',{
                    expiresIn:"1h"
                });
                res.json({
                    message:'Bienvenido',
                    token:token
                });
            }else{
                res.json({message:'password incorrecto'});
            }

        }else{
            res.json({message:'el email es incorrecto'});
        }

    });
});
//foto
router.post("/uploadfoto",(req, res) => {
    var params = req.query;
    var id = params.id;
    var SUPERES = res;
    User.findOne({_id: id}).exec((err, docs) => {
      if (err) {
        res.status(501).json({
          "msn" : "Problemas con la base de datos"
        });
        return;
      }
      if (docs != undefined) {
        upload(req, res, (err) => {
          if (err) {
            res.status(500).json({
              "msn" : "Error al subir la imagen"
            });
            return;
          }
          var url = req.file.path.replace(/public/g, "");
  
          User.update({_id: id}, {$set:{picture:url}}, (err, docs) => {
            if (err) {
              res.status(200).json({
                "msn" : err
              });
              return;
            }
            res.status(200).json(docs);
          });
        });
      }
    });
  });


module.exports=router;