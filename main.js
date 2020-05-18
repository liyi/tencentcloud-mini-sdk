'use strict'

const crypto = require('crypto')
const https = require('https')

const sha256 = data => crypto.createHash('sha256').update(data)
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data)

function unicode (str) {
  /* 对非ASCII字符进行unicode编码 */

  let result = ''
  for (let i = 0; i < str.length; i++) {
    let u = str[i].charCodeAt(0)
    if (u > 255) {
      result += '\\u' + `00${u.toString(16)}`.slice(-4)
    } else {
      result += str[i]
    }
  }
  return result
}

function sign ({
  secretId,
  secretKey,
  service,
  host,
  timestamp,
  payload
}) {
  /* 签名方法v3 */

  /* 收集一些必要的参数 */
  const dateObj = new Date(timestamp * 1000)
  const date = [
    dateObj.getUTCFullYear(),
    `0${dateObj.getUTCMonth() + 1}`.slice(-2),
    `0${dateObj.getUTCDate()}`.slice(-2)
  ].join('-')
  const algorithm = 'TC3-HMAC-SHA256'
  const signedHeaders = 'content-type;host'
  const credentialScope = `${date}/${service}/tc3_request`

  /* 第1步：拼接规范请求串 */
  const canonicalRequest = 
`POST
/

content-type:application/json; charset=utf-8
host:${host}

${signedHeaders}
${sha256(payload).digest('hex')}`

  /* 第2步：拼接待签名字符串 */
  const stringToSign = 
`${algorithm}
${timestamp}
${credentialScope}
${sha256(canonicalRequest).digest('hex')}`

  /* 第3步：计算签名 */
  const secretDate = hmac(`TC3${secretKey}`, date).digest()
  const secretService = hmac(secretDate, service).digest()
  const secretSigning = hmac(secretService, 'tc3_request').digest()
  const signature = hmac(secretSigning, stringToSign).digest('hex')

  /* 第4步：Authorization */
  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  return authorization
}

module.exports = function ({
  secretId,
  secretKey,
  service,
  host,
  params
}) {
  const payload = unicode(JSON.stringify(params))
  const timestamp = parseInt(Date.now() / 1000)
  const authorization = sign({
    secretId,
    secretKey,
    service,
    host,
    timestamp,
    payload
  })

  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://${host}`,
      {
        method: 'POST',
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json; charset=utf-8',
          Host: host,
          'X-TC-Action': params.Action,
          'X-TC-Version': params.Version,
          'X-TC-Timestamp': timestamp,
          'X-TC-Region': params.Region
        }
      },
      res => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          let json = JSON.parse(data)
          if (json.Response && json.Response.Error) {
            reject(json.Response)
          } else {
            resolve(json.Response)
          }
        })
      }
    )
    req.on('error', err => {
      reject({
        Code: err.code,
        Message: err.message
      })
    })
    req.end(payload, 'utf8')
  })
}
