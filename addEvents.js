const Moralis = require("morail/node");
require("dotenv").config();

const contractAddresses = require("./constants/networkMapping.json");
const contractAddress = contractAddresses[contractAddresses.length - 1]
let chainId = process.env.chainId || 31337;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_APP_ID;
const masterKey = process.env.masterKey;

const main = async () => {
	await Moralis.start({ serverUrl, appId, masterKey });
	console.log("Working with address: ", contractAddresses);

	let itemListedOptions = {
		chainId,
        address: contractAddress,
		sync_historical: true,
		topic: "itemListed(address,address,uint256,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "seller",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddress",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
				{
					indexed: false,
					internalType: "uint256",
					name: "price",
					type: "uint256",
				},
			],
			name: "ItemListed",
			type: "event",
		},
		tableName: "itemListed",
	};

	let itemBoughtOptions = {
		chainId,
        address: contractAddress,
		sync_historical: true,
		topic: "itemBought(address,address,uint256,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "buyer",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddress",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
				{
					indexed: false,
					internalType: "uint256",
					name: "price",
					type: "uint256",
				},
			],
			name: "ItemBought",
			type: "event",
		},
		tableName: "itemBought",
	};

	let itemCancelledOptions = {
		chainId,
        address: contractAddress,
		sync_historical: true,
		topic: "ItemCancelled(address,address,uint256)",
		abi: {
			anonymous: false,
			inputs: [
				{
					indexed: true,
					internalType: "address",
					name: "seller",
					type: "address",
				},
				{
					indexed: true,
					internalType: "address",
					name: "nftAddress",
					type: "address",
				},
				{
					indexed: true,
					internalType: "uint256",
					name: "tokenId",
					type: "uint256",
				},
			],
			name: "ItemCancelled",
			type: "event",
		},
		tableName: "ItemCancelled",
	};

	const listedResponse = await Moralis.Cloud.run(
		"watchContractEvent",
		itemListedOptions,
		{ useMasterKey: true }
	);

	const boughtResponse = await Moralis.Cloud.run(
		"watchContractEvent",
		itemBoughtOptions,
		{ useMasterKey: true }
	);

	const cancelledResponse = await Moralis.Cloud.run(
		"watchContractEvent",
		itemCancelledOptions,
		{ useMasterKey: true }
	);

	if (
		listedResponse.success &&
		boughtResponse.success &&
		cancelledResponse.response
	) {
		console.log("Success! Database updated with events.");
	} else {
		console.log("Something went wrong.");
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
