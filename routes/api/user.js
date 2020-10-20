const User=require('../../database/collection/user');
const express=require('express');
const empty=require('is-empty');
const path=require('path');
const fs=require('fs');
const sha1=require('sha1');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const router=express.Router();
//foto
const storage = multer.diskStorage({
    destination: function (res, file, cb) {
        try {
            fs.statSync('./public/fotos');
        } catch (e) {
            fs.mkdirSync('./public/fotos');
        }
        cb(null, './public/fotos');
    },
    filename:(res, file, cb) => {
        cb(null, 'IMG-' + Date.now() + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        return cb(null, true);
    }
    return cb(new Error('Solo se admiten imagenes png y jpg jpeg'));
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
}).single('foto')
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
router.post('/',  function (req, res, next) {
    
    upload(req, res, (error) => {
        if(error){
          return res.status(500).json({
            detalle: error,
            "error" : error.message
    
          });
        }else{
          if (req.file == undefined) {
                return res.status(400).json({
                "error" : 'No se recibio la imagen'        
                });
            }
            req.body.password=sha1(req.body.password);
            console.log(req.file);
            let url = req.file.path.substr(6, req.file.path.length);
            console.log(url);
            const datos = {
                nombre: req.body.nombre,
                foto: url,
                email: req.body.email,
                password: req.body.password
            };
var modelUser = new User(datos);
            modelUser.save()
                .then(result => {
                    res.json({
                        message: "Usuario insertado en la bd",
                        id: result._id
                    })
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    })
                });
                
                }
    })
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
module.exports=router;