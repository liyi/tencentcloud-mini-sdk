# tencentcloud-mini-sdk

## 安装

```shell
pip install git+https://github.com/liyi/tencentcloud-mini-sdk.git@python
```

## 示例

以 CVM 为例，查询地域列表

### 直接使用

```python
from tencentcloud_mini_sdk import sdk

try:
    res = sdk(
        secret_id='abcdefghijklmnopqrstuvwxyz', # 替换为你的SecretId
        secret_key='abcdefghijklmnopqrstuvwxyz', # 替换为你的SecretKey
        service='cvm', # 产品名，必须与调用的产品域名一致
        host='cvm.tencentcloudapi.com', # 接口请求域名，每个 API 的文档都有说明
        params={ # 接口参数，详见具体 API 文档
            'Action': 'DescribeRegions',
            'Version': '2017-03-12',
            'Region': ''
        }
    )
    print(res)
except Exception as err:
    print(err)
```

### 二次封装

```python
from tencentcloud_mini_sdk import sdk

def cvm_client(params):
    try:
        res = sdk(
            secret_id='abcdefghijklmnopqrstuvwxyz',
            secret_key='abcdefghijklmnopqrstuvwxyz',
            service='cvm',
            host='cvm.tencentcloudapi.com',
            params={
                **{
                    'Version': '2017-03-12',
                    'Region': ''
                },
                **params
            }
        )
        print(res)
    except Exception as err:
        print(err)

cvm_client({
    'Action': 'DescribeRegions'
})
```

### 基于类的二次封装

```python
from tencentcloud_mini_sdk import sdk

class CvmClient:
    def __init__(self, secret_id, secret_key):
        self.secret_id = secret_id
        self.secret_key = secret_key
    
    def request(self, params):
        try:
            res = sdk(
                secret_id=self.secret_id,
                secret_key=self.secret_key,
                service='cvm',
                host='cvm.tencentcloudapi.com',
                params={
                    **{
                        'Version': '2017-03-12',
                        'Region': ''
                    },
                    **params
                }
            )
            print(res)
        except Exception as err:
            print(err)
    
    # 更多自定义方法...


cvm_client = CvmClient(
    secret_id='abcdefghijklmnopqrstuvwxyz',
    secret_key='abcdefghijklmnopqrstuvwxyz'
)


cvm_client.request({
    'Action': 'DescribeRegions'
})
```
