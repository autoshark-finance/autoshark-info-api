import { VercelRequest, VercelResponse } from "@vercel/node";
import { getBundle, getTokenByAddress } from "../../utils";
import { return200, return400, return500 } from "../../utils/response";
import { getAddress } from "@ethersproject/address";
import BigNumber from "bignumber.js";

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  if (
    !req.query.address ||
    typeof req.query.address !== "string" ||
    !req.query.address.match(/^0x[0-9a-fA-F]{40}$/)
  ) {
    return400(res, "Invalid address");
    return;
  }

  try {
    const address = getAddress(req.query.address);
    const token = await getTokenByAddress(address.toLowerCase());
    const [ethPrice] = await getBundle("1");

    return200(res, {
      updated_at: new Date().getTime(),
      data: {
        name: token?.name,
        symbol: token?.symbol,
        price: new BigNumber(token?.derivedETH).times(new BigNumber(ethPrice)).toString(),
        price_BNB: token?.derivedETH,
      },
    });
  } catch (error: any) {
    return500(res, error);
  }
}
