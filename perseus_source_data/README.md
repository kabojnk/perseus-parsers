# Perseus Source Data

Right now I'm only storing *Greek and Roman collection texts*, available from this URL: [http://www.perseus.tufts.edu/hopper/opensource/download](http://www.perseus.tufts.edu/hopper/opensource/download).

It should be noted that these texts are licensed under the Creative Commons ShareAlike 3.0 License, which can be read here: [http://creativecommons.org/licenses/by-sa/3.0/us/](http://creativecommons.org/licenses/by-sa/3.0/us/)

## Data Sanitization

Odds are there are duplicate XML files for each "work" being parsed—1) the original file, and 2) the sanitized file (with the `_sanitized` suffix in the filename). The sanitized file has undergone preprocessing to ensure that XML parsing happens without a hitch (and prevents having to spare the memory to do this on the fly in the JS).