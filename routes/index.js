
var express = require('express');
var router = express.Router();
var conn = require('./../config.js');

/*image upload*/
var multer = require("multer");

var storage = multer.diskStorage({
destination: function(req,file,cb){
cb(null,'public/uploads/')
},
filename: function(req,file,cb){
cb(null,file.originalname);

conn.query('insert into notes (note,file_name) values ("'+file.originalname+'","'+req.body.file_name+'")',function(err,rows,field){
	if(err){
		throw err;
	}
	
})
}
})

var upload = multer({storage: storage})
/*image upload end*/

router.get('/',function(req,res,next){
	res.render('index',{title:'express'});
});

/*image upload post*/
router.post('/',upload.any(),function(req,res,next){
	res.redirect("/upload")
	//console.log(req.files)
});
/*image upload end post*/

router.get("/upload",function(req,res){
	var userlist = [];
	conn.query("select * from notes",function(err,results,field){
		if(err){
			throw err;
		}
		else{
			for(var i=0; i<results.length; i++){
				var users = {
					'id':results[i].id,
					'note':results[i].note,
					'name':results[i].file_name,
				}
				userlist.push(users)
			}
			res.render('image', {"userlist": userlist });
		}
	})
})
router.get('/register',function(req,res){
	res.render('users',{title:'register'})
})
//register to the user    (api --> http://localhost:3000/register  method --> post)
router.post("/register",function(req,res){
	var today = new Date();
	var user = {
		"name":req.body.name,
		"mname":req.body.mname,
		"lname":req.body.lname,
		"standard":req.body.standard,
		"age":req.body.age,
		"email":req.body.email,
		"mobile":req.body.mobile,
		"password":req.body.password,
		"createddate":today,
		"updatedate":today
	}
	
	conn.query('insert into register set ?',user,function(err,rows,fields){
		if(err){
			res.json({
				status:400,
				message:err
			})
		}
		else{
			res.json({
				status:200,
				message:'one row add to the database'
			})
		}
	})
})


// login to the user  (api --> http://localhost:3000/login   method --> post)
router.post("/login",function(req,res){
	var mobile = req.body.mobile;
	var password = req.body.password;
	
	
	conn.query("select * from register where mobile = ?",[mobile],function(err,results,fields){
		if(err){
			res.json({
				status:false,
				message:'urs query is not working'
			})
		}
	
		else{
			if(results.length > 0){
				if(password == results[0].password){
					req.session.results = results;
					res.json({
						status:200,
						message:"login success"
					})
				}

				else{
					
					res.json({
						status:400,
						message:"pwd is wrong"
					})
				}
			}
			else{
				res.json({
					status:400,
					message:"user not"
				})
			}
		}
	})
})


// get the data list (api --> http://localhost:3000/list    method --> get)

router.get("/list",function(req,res){
	// session for api
	if(!req.session.results){
		return res.status(400).send("can't show the list");
	}
	/* session for web
		if(!req.session.results){
			res.render("/login")   // redirect to the login page
		}
	*/
	
	conn.query("select * from register",function(err,rows,fields){
		if(err){
			res.json({
				status:400,
				message:"no user found in this database"+err
			})
		}
		else{
			res.json({
				status:200,
				message:rows
			})
		}
	})
})

//get the data of particular id (api --> http://localhost:3000/list/id    method --> get)
router.get("/list/:id",function(req,res){
	if(!req.session.results){
		res.json({
			status:200,
			message:"login first"
		})
	}
	conn.query("select * from register where id = ?",+req.params.id,function(err,rows,fields){
		if(err){
			res.json({
				status:400,
				message:"id is not in list"
			})
		}
		else{
			if(rows.length > 0){
				var stud = {
					id : rows[0].id,
					name : rows[0].name,
					mname : rows[0].mname,
					lname : rows[0].lname,
					age : rows[0].age,
					email : rows[0].email,
					mobile : rows[0].mobile,
					createddate : rows[0].createddate,
					updatedate : rows[0].updatedate
				}
				res.json({
					status:200,
					message:stud
				})
			}
			else{
				res.json({
					status:400,
					message:"no list value"
				})
			}
		}
	})
})

// edit the data (api --> http://localhost:3000/edit/id   method --> post)
router.post("/edit/:id",function(req,res){
	if(!req.session.results){
		res.json({
			status:200,
			message:"first login user then edit the data"
		})
	}
	var today = new Date();
	var users = {
		name:req.body.name,
		mname:req.body.mname,
		age:req.body.age,
		lname:req.body.lname,
		standard:req.body.standard,
		email:req.body.email,
		mobile:req.body.mobile,
		updatedate:today
	}
	
	conn.query("update register set ? where id = "+req.params.id,users,function(err,rows,fields){
		if(err){
			res.json({
				status:400,
				message:"not yet updated"+err
			})
		}
		else{
			res.json({
				status:200,
				message:"row updated"
			})
		}
	})
})


// delete the data (api --> http://localhost:3000/delete/id     method --> delete)
router.delete("/delete/:id",function(req,res){
	if(!req.session.results){
		res.json({
			status:200,
			message:"first you login the user then delete it"
		})
	}
	var id = req.params.id;
	conn.query("delete from register where id = ?",+req.params.id,function(err,results,fields){
		if(err){
			res.json({
				status:400,
				message:"can't delete the rows"+err
			})
		}
		else{
			res.json({
				status:200,
				message:"delete the row successfull"
			})
		}
	})
})

// search for users (api --> http://localhost:3000/search?name=anil     method --> get)
router.get("/search",function(req,res){
	conn.query('SELECT * from register where name like "%'+req.query.name+'%"',function(err,rows,fields){
		if(err){
			res.json({
				status:400,
				message:"no search data in the list"+err
			})
		}
		else{
			var data=[];
			for(i=0;i<rows.length;i++)
			{
				var user=({
					name:rows[i].name,
					age:rows[i].age,
					lname:rows[i].lname
				})
			data.push(user);

			}
			res.end(JSON.stringify(data));
			//res.render('index',{data:data})
		}
	})
})

//logout     (api --> http://localhost:3000/logout)
router.get("/logout",function(req,res){
	req.session.destroy(function(){
		res.json({
			status:200,
			message:"user logout"
		})
	})
	
})

router.get("/dashboard",function(req,res){
	res.render("dashboard",{data:"this is the dashboard page details .."})
	
})

// sql 
router.get("/highest",function(req,res){
	
	conn.query("select r1.name,a1.note,a1.file_name,r1.id from register r1,notes a1 where a1.id = r1.id",function(err,result){
		if(err){
			res.json({
				status:404,
				message:"no value print"+err
			})
		}
		
		else{
			for(i=0;i<result.length;i++)
			{
				var name = result[i].name;
				var note = result[i].note;
				var file_name = result[i].file_name;
				var key = result[i].id
				//console.log(name)
				conn.query('insert into `file_details` (name,note,fm,key1) values("'+name+'","'+note+'","'+file_name+'","'+key+'")',function(err,result,fields){
					if(err){
						res.json({
							status:404,
							message:"not stored value"+err
						})
					}
					else{
						res.json({
							status:200,
							message:"value stored to database"
						})
					}
				})
			}
			
		}
	})
})
// sql end

				
module.exports = router;
