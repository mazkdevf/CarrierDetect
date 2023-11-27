# CarrierDetect
With this JavaScript script you can easily find carrier of the phone number, this is using freecarrierlookup to fetch the data from.

## Example Code
```js
const identifier = new CarrierDetect();
let carrier = await identifier.fetchCarrier("<country code>", "<number without country>");
```

will return as:
```json
{
    "success": "false / true (BOOL)",
    "carrier": "Carrier Name / Null",
    "err": "Error Text / OR NOT"
}
```
