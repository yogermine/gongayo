 
 // server.js — 로컬 개발용 API 서버
import http from 'http'
import https from 'https'
import { readFileSync } from 'fs'

// .env.local 에서 API 키 읽기
const envFile = readFileSync('.env.local', 'utf-8')
const API_KEY = envFile
  .split('\n')
  .find(l => l.startsWith('VITE_ANTHROPIC_API_KEY='))
  ?.split('=')[1]?.trim()

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }
  if (req.method !== 'POST' || req.url !== '/api/ai') {
    res.writeHead(404); res.end(); return
  }

  let body = ''
  req.on('data', d => body += d)
  req.on('end', () => {
    const parsed = JSON.parse(body)
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: parsed.max_tokens || 2000,
      messages: parsed.messages
    })

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    }

    const apiReq = https.request(options, apiRes => {
      let data = ''
      apiRes.on('data', d => data += d)
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' })
        res.end(data)
      })
    })
    apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({error: e.message})) })
    apiReq.write(payload)
    apiReq.end()
  })
}).listen(3001, () => console.log('✓ API 서버 실행 중: http://localhost:3001'))