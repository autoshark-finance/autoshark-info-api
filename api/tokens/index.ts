import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "@ethersproject/address";
import { getBundle, getTopPairs } from "../../utils";
import { return200, return500 } from "../../utils/response";
import BigNumber from "bignumber.js";

interface ReturnShape {
  [tokenAddress: string]: {
    name: string;
    symbol: string;
    price: string;
    price_BNB: string;
  };
}

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const topPairs = await getTopPairs();
    const [ethPrice] = await getBundle("1");
    const tokens = topPairs.reduce<ReturnShape>((accumulator, pair): ReturnShape => {
      for (const token of [pair.token0, pair.token1]) {
        const tId = getAddress(token.id);

        accumulator[tId] = {
          name: token.name,
          symbol: token.symbol,
          price: new BigNumber(token.derivedETH).times(new BigNumber(ethPrice)).toString(),
          price_BNB: token.derivedETH,
        };
      }

      return accumulator;
    }, {});

    return200(res, { updated_at: new Date().getTime(), data: tokens });
  } catch (error: any) {
    return500(res, error);
  }
}
