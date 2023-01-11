import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import nftMarketplaceAbi from "../constants/NftMarketplace.json";
import nftAbi from "../constants/BasicNft.json";

export default function UpdateListingModal({
	nftAddress,
	tokenId,
	isVisible,
	marketplaceAddress,
	onClose,
}) {
	const dispatch = useNotification();
	const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

	const { runContractFunction: updateListing } = useWeb3Contract({
		abi: nftMarketplaceAbi,
		contractAddress: marketplaceAddress,
		functionName: "updateListing",
		params: {
			nftAddress,
			tokenId,
			newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
		},
	});

	const handleUpdateListingSuccess = async (tx) => {
		onClose && onClose();
		dispatch({
			type: "info",
			message: "Listing updating...",
			title: "Please Wait for block confirmations.",
			position: "bottomL",
		});
		await tx.wait(1);
		dispatch({
			type: "success",
			message: "Listing updated",
			title: "Listing updated - please refresh and move blocks",
			position: "bottomL",
		});

		setPriceToUpdateListingWith("0");
	};

	return (
		<Modal
			isVisible={isVisible}
			onCancel={onClose}
			onCloseButtonPressed={onClose}
			onOk={() => {
				updateListing({
					onError: (err) => console.log(err),
					onSuccess: handleUpdateListingSuccess,
				});
			}}
            okText="Confirm"
		>
			<Input
				label="Update listing price L1 Currency (ETH)"
				name="New listing price"
				type="number"
				onChange={(event) =>
					setPriceToUpdateListingWith(event.target.value)
				}
				style={{ marginBottom: 16 }}
			></Input>
		</Modal>
	);
}
