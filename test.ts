import { Selector } from 'testcafe';
import * as fs from 'fs';

const extractMatch = async (t: TestController, matchLabels: string[]) => {
    const specificationTable = Selector('.specifications-table > tbody > tr');
    // console.log(specificationTable.textContent);

    var countSpecs = await specificationTable.count;
    // console.log(countSpecs);
    // going through the Spec table on page
    for (var i = 0; i < countSpecs; i++) {

        const label = await specificationTable.nth(i).find("td").nth(0).textContent;

        if (matchLabels.includes(label)) {
            return await specificationTable.nth(i).find("td").nth(1).textContent;
        }
    }
}


function saveDb() {
    fs.writeFileSync("./cache.json", JSON.stringify(cache, null, 4));
}

fixture`Getting Started`
    .page`https://www.emag.ro/`;

interface ITestConfig {
    url: String;
    components: ITestConfigComponent[];
}

export type ITestConfigComponentMatch = { [key: string]: string[] };

interface ITestConfigComponent {
    id: string;
    keywords: string[];
    match: ITestConfigComponentMatch;
}

// const sleep = (t: number): Promise<void> => {
//     return new Promise((resolve) => {
//         setTimeout(() => { resolve(); }, t);
//     });
// };

let cache: any = fs.existsSync("./cache.json") ? JSON.parse(fs.readFileSync("./cache.json").toString("utf-8")) : {
    //
};


test('CheapSystemBuyTest', async t => {

    await t.resizeWindow(1920, 1080);

    const config: ITestConfig = JSON.parse(fs.readFileSync("test.config.json").toString("utf-8"));

    console.log(config.url);

    if (!cache.search) {
        cache.search = {};
    }

    if (!cache.products) {
        cache.products = {};
    }


    // iterate thru lsit of components
    for (const c of config.components) {

        if (!cache.search[c.id]) {
            cache.search[c.id] = {};
        }

        if (!cache.products[c.id]) {
            cache.products[c.id] = [];
        }

        if (!cache.product) {
            cache.product = {};
        }


        // iterate thru lsit of components keywords that represent the product id
        for (const k of c.keywords) {
            // https://www.emag.ro/search/procesoare/5600x/c?ref=search_category_1

            let urls: string[] = cache.search[c.id][k];

            // if we have no cache for it we walk the urls and store it into the cache ( we do the actual crawling of the product pages )
            if (urls == undefined) {
                cache.search[c.id][k] = [];
                urls = cache.search[c.id][k];

                await t
                    .navigateTo(`${config.url}/search/${c.id}/${k}/c`)
                    // await sleep(2000);
                    .click('.gtm_ejaugtrtnc')
                    .click('[data-sort-dir="asc"]')
                const a = await Selector('div.card-v2-info > a:first-child');
                var count = parseInt(await Selector('div.js-listing-pagination > strong:nth-child(2)').textContent);
                if (count > 10) {
                    count = 10;
                }

                // we get the search result list urls 
                for (var i = 0; i < count; i++) {
                    const pUrl = await a.nth(i).getAttribute("href");
                    console.log(pUrl);
                    urls.push(pUrl)
                }
            }

            // if we have match definition for the current component.. we do the conga !

            for (const url of urls) {

                let invalid = false;

                const id = url.split("/")[5];

                if (cache.product[id]) {
                    continue;
                }

                await t
                    .navigateTo(url);
                const priceSelect = await Selector('p.product-new-price').textContent;
                const priceInNumber = Number(priceSelect.replace(".", "").replace(",", ".").replace(" Lei", ""));
                console.log(priceInNumber);
                const p = {
                    id: id,
                    url: url,
                    name: (await Selector('div.page-header > h1').textContent).trim(),
                    code: (await Selector('span.product-code-display').textContent).substring(11).trim(),

                    price: priceInNumber,
                    match: {}
                }

                await t.click('[href="#specification-section"]')
                    .click('[data-ph-target="#specifications-body"]');

                // if test config hs match valus defiend for this componetn
                if (c.match) {
                    for (const matchKey in c.match) {
                        if (c.match[matchKey]) {
                            const matchValue = await extractMatch(t, c.match[matchKey]);

                            if (matchValue) {
                                p.match[matchKey] = matchValue.trim();
                            } else {
                                cache.products[c.id].push(p.id);
                                invalid = true;
                                break;
                            }
                        }
                    }
                }

                if (invalid) {
                    continue;
                }

                cache.products[c.id].push(p.id);
                cache.product[p.id] = p;
                saveDb();
            }
        }
    }
    saveDb();

    //de aici se verifica if match ii la fel
    const matchMap = {};

    // iterate thru list of components
    for (const c of cache.products) {
        if (c.match)  {
        for (const p of cache.products[c.id]) {
            const mkv = []; // match key valeus ( AM4_DDR4 )
            console.log(cache.product[p].match);
            for(const matchKey in cache.product.p.match) {
                // console.log(matchKey);
                mkv.push(cache.product[p].match[matchKey]);
                // console.log(mkv);
            }

            matchMap[mkv.join("_")][c.id].push(p);
            console.log(matchMap);


            // 
            // for(const matchKey in c.match) {
            //     matchMap[matchKey][c.id].sort(); // ... sort by price asc
            // }
        }
            } else {
                console.log("no match");
            matchMap[""][c.id] = cache.products[c.id];
        


        // luat decizia

    }}
});

