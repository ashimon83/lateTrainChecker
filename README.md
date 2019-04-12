# Late Train Checker
## Why
- Because Japanese commuting train is so terrible!
- To notify on slack which train lines are late.

## How
- From free data source get late train list.
- Get train line needed to check from Firestore.
- Hit slack app url and notify to any channel.

## data source(thanks!)
https://rti-giken.jp/fhc/api/train_tetsudo/