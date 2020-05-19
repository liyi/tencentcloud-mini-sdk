# tencentcloud-mini-sdk

## 安装

```shell
npm install liyi/tencentcloud-mini-sdk#nodejs
```

## 示例

以 CVM 为例，查询地域列表

### 直接使用

```javascript
const sdk = require('tencentcloud-mini-sdk')

// 获取CVM地域列表
sdk({
  secretId: 'abcdefghijklmnopqrstuvwxyz', // 替换为你的SecretId
  secretKey: 'abcdefghijklmnopqrstuvwxyz', // 替换为你的SecretKey
  service: 'cvm', // 产品名，必须与调用的产品域名一致
  host: 'cvm.tencentcloudapi.com', // 接口请求域名，每个 API 的文档都有说明
  params: { // 输入参数，详见具体 API 文档
      Action: 'DescribeRegions',
      Version: '2017-03-12',
      Region: ''
  }
})
.then(console.log)
.catch(console.error)
```

### 二次封装

```javascript
const sdk = require('tencentcloud-mini-sdk')

const cvmClient = function (params) {
  return sdk({
    secretId: 'abcdefghijklmnopqrstuvwxyz',
    secretKey: 'abcdefghijklmnopqrstuvwxyz',
    service: 'cvm',
    host: 'cvm.tencentcloudapi.com',
    params: {
      Version: '2017-03-12',
      Region: '',
      ...params
    }
  })
}

cvmClient({
  Action: 'DescribeRegions'
})
.then(console.log)
.catch(console.error)
```

### 基于类的二次封装

```javascript
const sdk = require('tencentcloud-mini-sdk')

class CvmClient {
  constructor ({
    secretId,
    secretKey,
    service,
    host
  }) {
    this.secretId = secretId
    this.secretKey = secretKey
    this.service = service
    this.host = host
  }

  request (params) {
    return sdk({
      secretId: this.secretId,
      secretKey: this.secretKey,
      service: this.service,
      host: this.host,
      params: {
        Version: '2017-03-12',
        Region: '',
        ...params
      }
    })
  }

  // 更多自定义方法...
}

const cvmClient = new CvmClient({
  secretId: 'abcdefghijklmnopqrstuvwxyz',
  secretKey: 'abcdefghijklmnopqrstuvwxyz',
  host: 'cvm.tencentcloudapi.com',
  service: 'cvm'
})

cvmClient.request({
  Action: 'DescribeRegions'
})
.then(console.log)
.catch(console.error)
```
