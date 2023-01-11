import { gql } from "@apollo/client";

const GET_ACTIVE_ITEMS = gql`
	{
		activeItems(
			first: 5
			where: { buyer: "0x0000000000000000000000000000000000000000" }
		) {
			id
			buyer
			seller
			nftAddress
			tokenId
			price
		}
	}
`;

const TOKEN_ID_DESC = gql`
	{
		itemListeds(orderBy: tokenId, orderDirection: desc) {
			tokenId
		}
	}
`;

export { GET_ACTIVE_ITEMS, TOKEN_ID_DESC };
