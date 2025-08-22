import token from "./token.json";
import dex from "./dex.json";

export const tokenAddress = token.contract.address;
export const tokenABI = token.contract.abi;

export const dexAddress = dex.contract.address;
export const dexABI = dex.contract.abi;
