import { expect } from "chai";
import { ethers, network} from "hardhat";
import { IERC20, TestUniswap, TestUniswap__factory } from "../typechain-types";
describe("TestUniswap", function () {
  let TestUniswap: TestUniswap__factory;
  let testUniswap: TestUniswap;
  let tokenIn: IERC20;
  let tokenOut: IERC20;
  const AMOUNT_IN = 100000000;
  const AMOUNT_OUT_MIN = 1;
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Toekn Out (DAI)
  const wBtcHolderAddreess = "0x1Cb17a66DC606a52785f69F08F4256526aBd4943" //WBTC Whale
  const wBtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" // Token In (WBTC)
  const TO = "0x843d94DE63012B1aB9d27E776A90Ff95285a3419"; // My Mata Mask address

  it("should pass", async function () {
    // Impersonating daiHolder's account
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [wBtcHolderAddreess],
    });
    // Make wBtcHolder the signer
    const signerWBTCHolder = await ethers.getSigner(wBtcHolderAddreess);

    tokenIn= await ethers.getContractAt("IERC20",wBtcAddress);
    tokenOut= await ethers.getContractAt("IERC20",daiAddress);
    const wBtcBalance = await tokenIn.balanceOf(wBtcHolderAddreess);
    console.log('----------------------------------------------------------------')
    console.log('wBTC Balance : ',wBtcBalance);
    TestUniswap = await ethers.getContractFactory("TestUniswap");
    testUniswap = await TestUniswap.deploy();
    const uniswapAddress = await testUniswap.getAddress();
    //console.log('uniswapAddress : ',uniswapAddress)
    await tokenIn.connect(signerWBTCHolder).approve(uniswapAddress,wBtcBalance);
    const allowance = await tokenIn.allowance(wBtcHolderAddreess, uniswapAddress);
    // Test approve() works as expected
    expect(allowance).to.equal(wBtcBalance);

    const balanceBefore = await tokenOut.balanceOf(TO);
    await testUniswap.connect(signerWBTCHolder).swap(
      wBtcAddress,
      daiAddress,
      AMOUNT_IN,
      AMOUNT_OUT_MIN,
      TO
    );

    const balanceAfter = await tokenOut.balanceOf(TO);
    console.log('balanceBefore : ',balanceBefore)
    console.log('balanceAfter : ',balanceAfter)
    // After swaping, balaceAfter should be bigger than balanceBefore.
    expect(parseInt(balanceAfter)).to.be.gt(parseInt(balanceBefore));
  });
});
