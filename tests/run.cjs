const http=require('http'),fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(req.url.split('?')[0]);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript'})[file.split('.').pop()]||'application/octet-stream');res.end(data);});
});
async function run(file){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',env:process.env});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(file+' exited '+code)));});}
server.listen(8123,'127.0.0.1',async()=>{try{await run('flow.cjs');await run('interactions.cjs');await run('reference-layout.cjs');await run('mobile-layout.cjs');}catch(e){console.error(e);process.exitCode=1;}finally{server.close();}});
server.on('error',error=>{console.error(error);process.exitCode=1;});
