import { run } from "hardhat";

const verify = async (contractAddress: string, args: any[]) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e: any) {
        if (e.message.includes("Contract source code already verified")) {
            console.log("Contract source code already verified");
        } else {
            console.log(e);
        }
    }
}

export {verify};