@echo off
setlocal
cd /d "%~dp0"
set PORT=4173
echo Starting Daret on Hedera (Unified V2 App) at http://127.0.0.1:%PORT% ...

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%PORT%"
  python -m http.server %PORT% --bind 127.0.0.1 --directory dist
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%PORT%"
  py -3 -m http.server %PORT% --bind 127.0.0.1 --directory dist
  goto :eof
)

where node >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%PORT%"
  if exist node_modules (
    call npm.cmd run preview -- --port %PORT% --host 127.0.0.1
  ) else (
    node -e "const http=require('http'),fs=require('fs'),path=require('path'),root=path.resolve('dist'),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};http.createServer((req,res)=>{let p=req.url.split('?')[0];if(p==='/')p='/index.html';if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(%PORT%,'127.0.0.1',()=>console.log('Serving dist at http://127.0.0.1:%PORT%'));"
  )
  goto :eof
)

echo Neither Python nor Node.js was found on PATH.
echo Please install Node.js (https://nodejs.org) or Python 3, then run this script again.
pause
