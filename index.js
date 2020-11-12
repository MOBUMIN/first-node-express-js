
var express = require("express");
var app=express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const PORT = 5000;
const fs = require('fs');
const dbFile = 'db.json';
const dbDataBuffer = fs.readFileSync(dbFile);
const dbJSON = dbDataBuffer.toString();
const data = JSON.parse(dbJSON);

app.get("/", function(req,res){
    res.send("Hello World\n");
});

app.listen(PORT,function(){
    console.log("simple api server is open!");
})

/* GET 요청받은 URI의 정보를 검색하여 응답한다. */
app.get('/todos', (req, res)=>{
    console.log('DB 정보 GET!');
    res.json(data);
});

app.get('/todos/:id', function(req,res){
    console.log('DB 정보 하나 GET!');
    res.json(data.todos[req.params.id-1]);
});

/* POST 요청된 자원을 생성 */
app.post('/todos/', function(req,res){
    console.log('POST 시작!');
    var result = {};
    var inputdata = req.body;

    /* 입력 빡세게 하기
    // invalid input
    if(!inputdata["content"] || !inputdata["completed"]){
        result["success"] = 0;
        result["error"] = "잘못된 입력";
        res.json(result);
        return;
    }

    // Duplicated
    if(data.todos[inputdata.id-1]){
        result["success"] = 0;
        result["error"] = "중복";
        res.json(result);
        return;
    }
    */

    // content만 입력 받는 경우
    if(!inputdata["content"]){
        result["success"] = 0;
        result["error"] = "잘못된 입력";
        res.json(result);
        return;
    }
    result["success"] = 1;
    var i = Object.keys(data.todos).length;
    data.todos[i]={
        "id":i+1,"content":inputdata.content,"completed":false
    }
    fs.writeFileSync(dbFile,JSON.stringify(data));
    result["todos"] = data.todos[i];
    console.log(i+1+" 항목 추가");
    res.json(result);
});

/* PUT,PATCH(일부만) 요청된 자원을 수정 */
app.patch('/todos/:id', function(req,res){
    console.log('PATCH 시작!');
    var result = {};
    var inputdata = req.body;
    var to_id = req.params.id-1;
    if(to_id > Object.keys(data.todos).length ){
        result["success"] = 0;
        result["error"] = "해당 항목 없음";
        res.json(result);
        return;
    }
    if(!inputdata["content"] && !inputdata["completed"]){
        result["success"] = 0;
        result["error"] = "수정 사항 없음";
        res.json(result);
        return;
    }
    if(inputdata["content"]){
        data.todos[to_id].content=inputdata.content;
    }
    if(inputdata["completed"]){
        data.todos[to_id].completed=inputdata.completed;
    }
    fs.writeFileSync(dbFile,JSON.stringify(data));
    result["success"]=1;
    result["todos"]=data.todos[to_id];
    console.log(to_id+1+" 항목 PATCH 완료");
    res.json(result);
});

/* DELETE 요청된 자원을 삭제 */
app.delete('/todos/:id',function(req,res){
    var result={};
    var de_id = req.params.id-1;
    if(!data.todos[de_id]){
        result["success"] = 0;
        result["error"] = "찾을 수 없음";
        res.json(result);
        return;
    }
    delete data.todos[de_id];
    data.todos = data.todos.filter(function(item){
        return item !== null;
    });
    fs.writeFileSync(dbFile,JSON.stringify(data));
    result["success"]=1;
    res.json(result);
    console.log(de_id+1+" 항목 제거");
});

app.use(function(res,res,next){
    res.status(404).send("NOT FOUND :D \n");
});