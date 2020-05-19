# -*- coding: UTF-8 -*-

import hashlib, hmac, json, datetime, urllib.request


sha256 = lambda s: hashlib.sha256(s.encode('utf-8'))
hmac256 = lambda key, s: hmac.new(key, s.encode('utf-8'), hashlib.sha256)


def sign(secret_id, secret_key, timestamp, service, host, payload):
    date = datetime.datetime.utcfromtimestamp(timestamp).date().__str__()
    algorithm = 'TC3-HMAC-SHA256'
    signed_headers = 'content-type;host'
    credential_scope = '{date}/{service}/tc3_request'.format(date=date, service=service)

    canonical_request = \
'''POST
/

content-type:application/json; charset=utf-8
host:{host}

{signed_headers}
{hashed_request_payload}'''\
        .format(
            host=host,
            signed_headers=signed_headers,
            hashed_request_payload=sha256(payload).hexdigest()
        )
    
    string_to_sign = \
'''{algorithm}
{timestamp}
{credential_scope}
{hashed_canonical_request}'''\
        .format(
            algorithm=algorithm,
            timestamp=timestamp,
            credential_scope=credential_scope,
            hashed_canonical_request=sha256(canonical_request).hexdigest()
        )
    
    secret_date = hmac256('TC3{}'.format(secret_key).encode('utf-8'), date).digest()
    secret_service = hmac256(secret_date, service).digest()
    secret_signing = hmac256(secret_service, 'tc3_request').digest()
    signature = hmac256(secret_signing, string_to_sign).hexdigest()

    authorization = '{algorithm} Credential={secret_id}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}'.format(
        algorithm=algorithm,
        secret_id=secret_id,
        credential_scope=credential_scope,
        signed_headers=signed_headers,
        signature=signature
    )

    return authorization


def sdk(secret_id, secret_key, service, host, params):
    payload = json.dumps(params).encode('raw_unicode_escape').decode('utf-8')
    timestamp = int(datetime.datetime.now().timestamp())

    authorization = sign(
        secret_id=secret_id,
        secret_key=secret_key,
        timestamp=timestamp,
        service=service,
        host=host,
        payload=payload
    )

    req = urllib.request.Request(
        url='https://{}'.format(host),
        data=payload.encode('utf-8'),
        headers={
            'Authorization': authorization,
            'Content-Type': 'application/json; charset=utf-8',
            'Host': host,
            'X-TC-Action': params['Action'],
            'X-TC-Version': params['Version'],
            'X-TC-Timestamp': timestamp,
            'X-TC-Region': params['Region']
        },
        method='POST'
    )
    res = urllib.request.urlopen(req).read().decode('utf-8')
    res_json = json.loads(res)['Response']
    if 'Error' in res_json:
        raise Exception(res_json)
    else:
        return res_json

__all__ = ['sdk']
