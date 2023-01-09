const { ethers, network } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

// lead this path to where the fronend folder is
const frontEndContractsFile = "../frontend/constants/networkMapping.json";
const frontEndAbiLocation = "../frontend/constants/";

module.exports = async () => {
	if (process.env.UPDATE_FRONT_END) {
		console.log("Updating Front End...");
		await updateContractAddresses();
		await updateAbi();
		console.log("Front End Updated!");
	}
};

async function updateAbi() {
	const nftMarketplace = await ethers.getContract("NftMarketplace");
	fs.writeFileSync(
		`${frontEndAbiLocation}NftMarketplace.json`,
		nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
	);

	const basicNft = await ethers.getContract("BasicNft");
	fs.writeFileSync(
		`${frontEndAbiLocation}BasicNft.json`,
		basicNft.interface.format(ethers.utils.FormatTypes.json)
	);
}

const updateContractAddresses = async () => {
	const nftMarketplace = await ethers.getContract("NftMarketplace");
	const chainId = network.config.chainId.toString();
	const jsonFile = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"));

	if (chainId in jsonFile) {
		if (
			!jsonFile[chainId]["NftMarketplace"].includes(
				nftMarketplace.address
			)
		) {
			jsonFile[chainId]["NftMarketplace"].push(nftMarketplace.address);
		}
	} else {
		// add a new entry
		jsonFile[chainId] = { NftMarketplace: [nftMarketplace.address] };
	}

	fs.writeFileSync(frontEndContractsFile, JSON.stringify(jsonFile));
};

module.exports.tags = ["all", "frontend"];
