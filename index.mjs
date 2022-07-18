import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from '../build/index.main.mjs';
import assert from 'assert';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';

const stdlib = loadStdlib();
const startingBalance = stdlib.parseCurrency(100);

const creator_name = await ask(`what's your name creator: `)
const bidder1_name = await ask(`what's your name bidder1: `)
const bidder2_name = await ask(`what's your name bidder2: `)


const acc_creator = await stdlib.newTestAccount(startingBalance);
const acc_bidder1 = await stdlib.newTestAccount(startingBalance);
const acc_bidder2 = await stdlib.newTestAccount(startingBalance);
const NFT = await stdlib.launchToken(acc_creator, "realty", "rty", { supply: 1 });

const ctc_creator = acc_creator.contract(backend);

const ctc_bidder1 = acc_bidder1.contract(backend, ctc_creator.getInfo())
const ctc_bidder2 = acc_bidder2.contract(backend, ctc_creator.getInfo())
const getbalance = async (acc, name) => {
    const amtNFT = await stdlib.balanceOf(acc, NFT.id);
    console.log(`${name} has ${amtNFT} tokens`)
}


await getbalance(acc_creator, creator_name)
await getbalance(acc_bidder1, bidder1_name)
await getbalance(acc_bidder2, bidder2_name)
const minimum_bid = await ask(`Creator enter the minimum bid: `)
const bidder1_bid = await ask(`Bidder1 enter your bid: `)
const bidder2_bid = await ask(`Bidder2 enter your bid: `)
await Promise.all([
    ctc_creator.p.Creator({
        getnft: async () => {
            return NFT.id
        },
        nftprice: stdlib.parseCurrency(minimum_bid),
        whitelisted_address: async (whitelisted) => {
            console.log(`${whitelisted} was whitelisted and recieved tokens `)
        },
    }),
    ctc_bidder1.p.Bidder1({
        gettok: async (tok) => {
            acc_bidder1.tokenAccept(tok)
            console.log(`${bidder1_name} accepted the token`)
        },
        bid: async () => {
            return stdlib.parseCurrency(bidder1_bid)
        },
    }),
    ctc_bidder2.p.Bidder2({
        gettok: async (tok) => {
            acc_bidder1.tokenAccept(tok)
            console.log(`${bidder2_name} accepted the token`)
        },
        bid: async () => {
            return stdlib.parseCurrency(bidder2_bid)
        },
    }),

]);

await getbalance(acc_creator, creator_name)
await getbalance(acc_bidder1, bidder1_name)
await getbalance(acc_bidder2, bidder2_name)

console.log(`Nft information: ${NFT.name}`)
