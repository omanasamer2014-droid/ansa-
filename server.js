import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const ADMIN_PASSWORD = "malak";
const DATA_FILE = path.join(__dirname, "events.json");

function readEvents(){
  try { return JSON.parse(fs.readFileSync(DATA_FILE,"utf8")) }
  catch { return [] }
}
function save(type,payload){
  const data = readEvents();
  data.unshift({type,payload,time:new Date().toISOString()});
  fs.writeFileSync(DATA_FILE,JSON.stringify(data,null,2));
}

app.use(express.static(path.join(__dirname,"public")));

app.post("/api/visit",(req,res)=>{
  save("visit",{page:req.body.page || "home",ip:req.ip});
  res.json({ok:true});
});

app.post("/api/select",(req,res)=>{
  save("select",req.body);
  res.json({ok:true});
});

app.get("/api/events",(req,res)=>{
  if(req.query.pw!=="malak") return res.status(401).end();
  res.json(readEvents());
});

app.post("/api/clear",(req,res)=>{
  if(req.body.pw!=="malak") return res.status(401).end();
  fs.writeFileSync(DATA_FILE,"[]");
  res.json({ok:true});
});

app.get("/admin",(req,res)=>{
  res.sendFile(path.join(__dirname,"public/admin.html"));
});

app.listen(PORT,()=>{
  console.log("الموقع: http://localhost:3000");
  console.log("لوحة التحكم: http://localhost:3000/admin");
});
