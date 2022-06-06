# Test emag buying cheapest system

## Definition
Automatic test that builds the cheapest computer configuration  based on a predefined list of components.

Example target:
https://www.emag.ro/

Key Points:
 - The test will add the products with the lowest prices based on the components definition below into the cart
 - Test definition file is modified according to the test implementation. Components list: cpu, mb, ram, video, ssd, case, power supply, cpu cooler
 - Test will assert that all configured components were found and added to the cart ( complete system )
 - Test will assert that the total price is below the expectedTotalLimit value
 - Various configurations of test will break the defined assertions ( min components list or total price limit )

Technologies used: TypeScript, TestCafe, CSS queries, HTML DOM
https://nodejs.org/en/
https://www.typescriptlang.org/
https://testcafe.io/

Test configuration example ( extend or modify it to fit the implementation ):

```json
{
"expectedTotalLimit" : 15000,
"url" : "https://www.emag.ro/",
"components": [
    {
        "id": "procesoare",
        "keywords": ["5600x"],
    },
    {
        "id": "placi_video",
        "keywords": ["6500-xt"],
    },
    {
        "id": "memorii",
        "keywords": ["kingston-fury-beast"],
        "match": [
            {
                "memory": ["Tip memorie"]
            }
        ]
    },
    {
        "id": "placi_baza",
        "keywords": ["gigabyte-socket-1200"],
        "match": [
            {
                "memory": ["Tip memorie"]
            }
        ]
    }
]
}
```

## Start
```
npm install
```