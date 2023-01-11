import { useState, useEffect } from "react";
import { ethers } from "ethers";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Image from "next/image";
import { Card, useNotification, Tooltip, Button } from "web3uikit";
import UpdateListingModal from "./UpdateListingModal";

export default function NFTBox({
	price,
	nftAddress,
	tokenId,
	marketplaceAddress,
	seller,
}) {
	const dispatch = useNotification();
	const [priceToUpdateListingWith, setPriceToUpdateListingWith] =
		useState("0");
	const { isWeb3Enabled, account } = useMoralis();
	const [imageUri, setImageUri] = useState("");
	const [tokenName, setTokenName] = useState("");
	const [tokenDescription, setTokenDescription] = useState("");
	const [showModal, setShowModal] = useState(false);
	const hideModal = () => {
		setShowModal(false);
	};

	const { runContractFunction: getTokenURI } = useWeb3Contract({
		abi: nftAbi,
		contractAddress: nftAddress,
		functionName: "tokenURI",
		params: {
			tokenId: tokenId,
		},
	});

	const { runContractFunction: buyItem } = useWeb3Contract({
		abi: nftMarketplaceAbi,
		contractAddress: marketplaceAddress,
		functionName: "buyItem",
		params: {
			nftAddress,
			tokenId,
			newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
		},
	});

	const updateUI = async () => {
		const tokenURI = await getTokenURI();

		if (tokenURI) {
			// put a gateway
			const requestURL = tokenURI.replace(
				"ipfs://",
				"https://ipfs.io/ipfs/"
			);
			console.log(requestURL);
			const tokenURIResponse = await (await fetch(requestURL)).json();
			const imageURI = tokenURIResponse.image;
			const imageURIURL = imageURI.replace(
				"ipfs://",
				"https://ipfs.io/ipfs/"
			);
			setImageUri(imageURIURL);
			setTokenName(tokenURIResponse.name);
			setTokenDescription(tokenURIResponse.description);
		}
	};

	const truncateString = (fullStr, strLen) => {
		if (fullStr.length <= strLen) return fullStr;

		// No need to understand this, if I/You can't. I just copied it.
		const seperator = "...";
		const seperatorLength = seperator.length;
		const charsToShow = strLen - seperatorLength;
		const frontChars = Math.ceil(charsToShow / 2);
		const backChars = Math.floor(charsToShow / 2);

		// it basically adds some .... in between long text
		return (
			fullStr.substring(0, frontChars) +
			seperator +
			fullStr.substring(fullStr.length - backChars)
		);
	};

	useEffect(() => {
		if (isWeb3Enabled) {
			updateUI();
		}
	}, [isWeb3Enabled]);

	const isOwnedByUser = seller === account || seller === undefined;
	const formattedSellerAddress = isOwnedByUser
		? "you"
		: truncateString(seller || "", 15);

	const handleBuyItemSuccess = async (tx) => {
		await tx.wait(1);
		dispatch({
			type: "success",
			message: "Item Bought",
			title: "Item Purchase Successful",
			position: "bottomL",
		});
	};

	const handleCardClick = () => {
		isOwnedByUser
			? setShowModal(true)
			: buyItem({
					onError: (err) => console.log(err),
					onSuccess: handleBuyItemSuccess,
			  });
	};

	return (
		<>
			{imageUri ? (
				<div style={{ margin: 16 }}>
					<UpdateListingModal
						isVisible={showModal}
						tokenId={tokenId}
						marketplaceAddress={marketplaceAddress}
						nftAddress={nftAddress}
						onClose={hideModal}
					/>
					<Card title={tokenName} onClick={handleCardClick}>
						<Tooltip content="Change Price" position="right">
							<div className="p-2">
								<div className="flex flex-col items-center gap-2">
									<div>#{tokenId}</div>
									<div className="italic text-sm">
										Owned by {formattedSellerAddress}
									</div>
									<Image
										loader={() => imageUri}
										src={imageUri}
										height="200"
										width="200"
										style={{ borderRadius: 12 }}
									/>
									<div className="font-bold">
										{ethers.utils.formatUnits(
											price,
											"ether"
										)}{" "}
										ETH
									</div>
									{!isOwnedByUser ? (
										<div>Click to Buy!</div>
									) : null}
								</div>
							</div>
						</Tooltip>
					</Card>
				</div>
			) : (
				<div>...</div>
			)}
		</>
	);
}
