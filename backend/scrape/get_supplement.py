import requests
import brotli

url = "https://examine.com/supplements/vitamin-b6/?show_conditions=true"

headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br",
    "user-agent": "Mozilla/5.0"
}

cookies = {
    "token": "784914%7CLToNHWtroRfIDLZdw7daUYj5Ag9HhpgfIEfGyHUwf51563aa",
    "pageviewCount": "3",
    "salesPageViewCount": "3"
}

r = requests.get(url, headers=headers, cookies=cookies)

raw = r.content
try:
    text = brotli.decompress(raw).decode()
except:
    try:
        text = raw.decode()
    except:
        text = raw

print(text)
