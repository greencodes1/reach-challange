'reach 0.1';

export const main = Reach.App(() => {
    const Creator = Participant('Creator', {
        getnft: Fun([], Token),
        nftprice: UInt,
        whitelisted_address: Fun([Address], Null)
    })
    const Bidder1 = Participant('Bidder1', {
        bid: Fun([], UInt),
        gettok: Fun([Token], Null)
    })
    const Bidder2 = Participant('Bidder2', {
        bid: Fun([], UInt),
        gettok: Fun([Token], Null)
    })

    init()

    Creator.only(() => {
        const tokId = declassify(interact.getnft())
        const nftPrice = declassify(interact.nftprice)
    })
    Creator.publish(tokId, nftPrice)
    const amt = 1;
    commit();
    Creator.pay([[amt, tokId]])
    commit()
    Bidder1.only(() => {
        const bidder1_bid = declassify(interact.bid())
        const gettok_b1 = declassify(interact.gettok(tokId))
    })
    Bidder1.publish(bidder1_bid, gettok_b1)
    commit()

    Bidder2.only(() => {
        const bidder2_bid = declassify(interact.bid())
        const gettok_b2 = declassify(interact.gettok(tokId))
    })
    Bidder2.publish(bidder2_bid, gettok_b2)

    const whitelist = new Map(Address, UInt)

    if (bidder1_bid > bidder2_bid && bidder1_bid >= nftPrice) {
        whitelist[Bidder1] = bidder1_bid
        commit()
        Creator.only(() => {
            const w_add = declassify(interact.whitelisted_address(Bidder1))
        })
        Creator.publish(w_add)
        commit()
        Bidder1.pay(bidder1_bid)
        transfer([[amt, tokId]]).to(Bidder1)
        transfer(bidder1_bid).to(Creator)
    } else {
        if (bidder2_bid > bidder1_bid && bidder2_bid >= nftPrice) {
            whitelist[Bidder2] = bidder2_bid
            commit()
            Creator.only(() => {
                const w_add = declassify(interact.whitelisted_address(Bidder2))
            })
            Creator.publish(w_add)
            commit()
            Bidder2.pay(bidder2_bid)
            transfer([[amt, tokId]]).to(Bidder2)
            transfer(bidder2_bid).to(Creator)
        } else {
            transfer([[amt, tokId]]).to(Creator)
        }
    }

    commit()

});
