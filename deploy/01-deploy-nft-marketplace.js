const { network } = require("hardhat");
const { devChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

// nft-sami-json: ipfs://QmXV1trm54VKBY6DxKPy9LrwPRQQjPZZ6dL2xCmqpbH8G5?filename=QmXV1trm54VKBY6DxKPy9LrwPRQQjPZZ6dL2xCmqpbH8G5

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deployer } = await getNamedAccounts();
	const { deploy, log } = deployments;
	const chainId = network.config.chainId;

	log("----------------------------------------");
	log("Deploying 01.");

	const nftMarketplace = await deploy("NftMarketplace", {
		from: deployer,
		args: [],
		log: true,
		blockConfirmations: network.config.blockConfirmations || 1,
	});

	log("Deployed.");

	if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		log("verifying...");
		await verify(nftMarketplace.address, []);
		log("verified!");
	}
	log("----------------------------------------");
};

module.exports.tags = ["all", "nftmarketplace"];
