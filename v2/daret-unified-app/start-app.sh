#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
PORT="${PORT:-4173}"
URL="http://127.0.0.1:$PORT"
echo "Starting Daret on Hedera (Unified V2 App) at $URL ..."

(sleep 1 && (command -v xdg-open >/dev/null && xdg-open "$URL" || command -v open >/dev/null && open "$URL" || true)) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory dist
elif command -v node >/dev/null 2>&1; then
  if [ -d node_modules ]; then
    npm run preview -- --port "$PORT" --host 127.0.0.1
  else
    node -e "const http=require('http'),fs=require('fs'),path=require('path'),root=path.resolve('dist'),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};http.createServer((req,res)=>{let p=req.url.split('?')[0];if(p==='/')p='/index.html';if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Serving dist at http://127.0.0.1:'+(process.env.PORT||4173)));"
  fi
else
  echo "Please install Python 3 or Node.js to start the local server."
  exit 1
fi
