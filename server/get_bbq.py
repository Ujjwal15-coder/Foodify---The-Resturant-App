import urllib.request
import os

url = 'https://logo.clearbit.com/barbequenation.com'
dest = '../client/public/assets/bbq_logo.png'

req = urllib.request.Request(
    url, 
    data=None, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
)

import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        with open(dest, 'wb') as out_file:
            out_file.write(response.read())
    print("Successfully downloaded high-res Barbeque Nation logo!")
except Exception as e:
    print("Error:", e)
