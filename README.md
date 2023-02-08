# VDF Parser
## Decoding Guide
VDFs are formatted in LE (little endian), meaning multi-byte values should be interpreted left-to-right. For example, a 16bit integer `0x01 0x00` should be interpreted as 1 instead of 256. In Node.js, use `buffer.readUInt32LE()` to read a 32bit unsigned integer.

There are a few bytes that will appear before any data. These bytes indicate which type of data will follow:
- The first data type is a map (or object, in JS terms), represented by `0x00`. The next byte will be the first entry inside of this new map.
- The second data type is a string, represented by `0x01`. The string is utf8-encoded, lasting until a NULL terminator is found (`0x00`). This is the only exception to `0x00`, changing the meaning from "Create a new map" to "Reached the end of a string". No other data types end in `0x00`.
- The third data type is an integer, represented by `0x02`. This is an unsigned 32bit int, meaning it will always consume exactly 4 bytes.
- The last data type indicates the end of a map, represented by `0x08`. The next byte will be the beginning of the next entry in the "parent" map.

## My Notes
>Below are the notes I took while learning the data. I opened an appinfo.vdf file with HxD (a hex editor) and went through each byte, comparing it to a premade JSON dump. I mentally converted each byte into the following symbols and added plaintext/numbers where it called for them. I then used the symbols' descriptions to convert it to JSON until I felt I got the hang of it and could write it in code.

```
; 0x00: Null terminator (terminate string if possible, otherwise begin map)
" 0x01: New property (string)
# 0x02: New property (int)
< 0x08: End map
```

`appinfo;#appid;7;common;"name;Steam Client;"type;Config;;associations;<#gameid;7<;extended;"beta_name_1;Steam Beta Update;"`

```javascript
[
  {
    appid: 7,
    common: {
      name: 'Steam Client',
      type: 'Config',
      associations: {}
    },
    gameid: 7,
    extended: {
      beta_name_1: 'Steam Beta Update',
      beta_contentlist_1: 'steamexe publicbeta',
      beta_name_2: 'Steam Deck Stable',
      beta_contentlist_2: 'steamexe steamdeck_stable',
      beta_name_3: 'Steam Deck Beta',
      // ...
    }
  }
]
```