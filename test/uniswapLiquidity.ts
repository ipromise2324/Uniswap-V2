import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";
import { network } from "hardhat";
import { IERC20, TestUniswapLiquidity, TestUniswapLiquidity__factory } from "../typechain-types";
describe("TestUniswapLiquidity", function () {
    let owner: Signer;
    let TestUniswapLiquidity: TestUniswapLiquidity__factory;
    let testUniswapLiquidity: TestUniswapLiquidity;
    let weth: IERC20;
    let dai: IERC20;
    const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH address
    const wethHolderAddress = "0x44Cc771fBE10DeA3836f37918cF89368589b6316"  // WETH Whale
    const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI address
    const daiHolderAddress = "0xFDA56cBd86e5576745495839Fa925B90638cDD1a" // DAI Whale
    const TOKEN_WETH_AMOUNT = 10000;
    const TOKEN__DAI_AMOUNT = 10000;
    it("add Liquidity should pass and remove liquidity should pass", async function () {
        [owner] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress();

        // Impersonating wethHolder's account
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [wethHolderAddress],
        });
        // Make wEthHolder the signer
        const signerWethHolder = await ethers.getSigner(wethHolderAddress);

        // Impersonating daiHolder's account
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [daiHolderAddress],
        });
        // Make wDaiHolder the signer
        const signerDaiHolder = await ethers.getSigner(daiHolderAddress);
        await weth.connect(signerWethHolder).transfer(ownerAddress,TOKEN_WETH_AMOUNT)
        await dai.connect(signerDaiHolder).transfer(ownerAddress,TOKEN__DAI_AMOUNT)
        //const ownerWethBalance = await weth.balanceOf(ownerAddress);
        //console.log("Owner WETH Balance:", ownerWethBalance.toString());
        //const ownerDaiBalance = await dai.balanceOf(ownerAddress);
        //console.log("Owner DAI Balance:", ownerDaiBalance.toString());
        
        weth= await ethers.getContractAt("IERC20",wethAddress);
        dai= await ethers.getContractAt("IERC20",daiAddress);
        const holderWethBalance = await weth.balanceOf(wethHolderAddress);
        //console.log("Holder WETH Balance:", holderWethBalance.toString());
        const holderDaiBalance = await dai.balanceOf(daiHolderAddress);
        //console.log("Holder DAI Balance:", holderDaiBalance.toString());

        TestUniswapLiquidity = await ethers.getContractFactory("TestUniswapLiquidity");
        testUniswapLiquidity = await TestUniswapLiquidity.deploy();
        const uniswapAddress = await testUniswapLiquidity.getAddress();

        await weth.connect(owner).approve(uniswapAddress,TOKEN_WETH_AMOUNT)
        await dai.connect(owner).approve(uniswapAddress,TOKEN__DAI_AMOUNT)
        const wethAllowance = await weth.allowance(ownerAddress, uniswapAddress);
        const daiAllowance = await dai.allowance(ownerAddress, uniswapAddress);
        // console.log('wethAllowance : ',wethAllowance)
        // console.log('daiAllowance : ',daiAllowance)
        expect(wethAllowance.toString()).to.equal(TOKEN_WETH_AMOUNT.toString());
        expect(daiAllowance.toString()).to.equal(TOKEN__DAI_AMOUNT.toString());


        let tx = await testUniswapLiquidity.connect(owner).addLiquidity(
            daiAddress,
            wethAddress,
            TOKEN__DAI_AMOUNT,
            TOKEN_WETH_AMOUNT
        );
        const receipt = await tx.wait();
        console.log("=== add liquidity ===");
        const events = await testUniswapLiquidity.queryFilter(testUniswapLiquidity.filters.addLiquidityLog());
        console.log("eventLength ", events.length);

        for (const event of events) {
            const eventArgs = event.args;
            console.log("eventArgs ", eventArgs);
        }

        tx = await testUniswapLiquidity.connect(owner).removeLiquidity(daiAddress, wethAddress);
        console.log("=== remove liquidity ===");
        const events2 = await testUniswapLiquidity.queryFilter(testUniswapLiquidity.filters.removeLiquidityLog());
        console.log("eventLength ", events2.length);

        for (const event of events2) {
            const eventArgs = event.args;
            console.log("eventArgs ", eventArgs);
        }
    });
});
