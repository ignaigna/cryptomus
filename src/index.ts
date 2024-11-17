import { createHash } from "node:crypto";
import {
	E_HTTP,
	E_TOKEN,
	type I_BLOCK_STATIC_WALLET_REQUEST,
	type I_BLOCK_STATIC_WALLET_RESPONSE,
	type I_CREATE_PAYMENT_REQUEST,
	type I_CREATE_PAYMENT_RESPONSE,
	type I_CREATE_STATIC_WALLET_REQUEST,
	type I_CREATE_STATIC_WALLET_RESPONSE,
	type I_GEN_QR_REQUEST,
	type I_GEN_QR_RESPONSE,
	type I_PAYMENT_INFO_REQUEST,
	type I_PAYMENT_INFO_RESPONSE,
	type I_PAYMENT_REFUND_REQUEST,
	type I_PAYMENT_REFUND_RESPONSE,
	type I_REFUND_FROM_BLOCK_WALLET_REQUEST,
	type I_REFUND_FROM_BLOCK_WALLET_RESPONSE,
	type I_RESEND_WEBHOOK_REQUEST,
	type I_RESEND_WEBHOOK_RESPONSE,
	type I_TEST_WEBHOOK_REQUEST,
	type I_TEST_WEBHOOK_RESPONSE,
	type I_CREATE_RECURRING_REQUEST,
	type I_CREATE_RECURRING_RESPONSE,
	type I_RECURRING_INFO_REQUEST,
	type I_RECURRING_INFO_RESPONSE,
	type I_RECURRING_LIST_REQUEST,
	type I_RECURRING_LIST_RESPONSE,
	type I_RECURRING_CANCEL_REQUEST,
	type I_RECURRING_CANCEL_RESPONSE,
} from "./types";
import { CryptomusError } from "./errors";

export class Cryptomus {
	constructor(
		private readonly merchant: string,
		private readonly paymentToken: string,
	) {}

	/**
	 * Sends a request to the specified route using the given HTTP method and token type.
	 *
	 * @param {E_HTTP} method - The HTTP method to use for the request.
	 * @param {E_TOKEN} type - The type of token to use for authentication.
	 * @param {string} route - The route to send the request to.
	 * @param {Record<string, any>} data - The data to include in the request.
	 * @return {Promise<T>} - A promise that resolves with the response data.
	 */
	async request<T>(
		method: E_HTTP,
		type: E_TOKEN,
		route: string,
		data: Record<string, any>,
	): Promise<T> {
		const url = new URL(`https://api.cryptomus.com/${route}`);
		const headers = {
			"Content-Type": "application/json",
			Merchant: this.merchant,
			Sign: this.makeSignature(data, this.paymentToken),
		};

		const options: RequestInit = {
			method,
			headers,
		};

		if (method === E_HTTP.GET) {
			for (const key of Object.keys(data)) {
				url.searchParams.append(key, data[key]);
			}
		} else if (method === E_HTTP.POST) {
			options.body = JSON.stringify(data);
		}

		try {
			const response = await fetch(url.toString(), options);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const responseData = await response.json();
			return responseData as T;
		} catch (error) {
			throw new CryptomusError(
				error instanceof Error ? error.message : String(error),
			);
		}
	}

	/**
	 * Creates a payment.
	 *
	 * @param {I_CREATE_PAYMENT_REQUEST} options - The payment options.
	 * @return {Promise<I_CREATE_PAYMENT_RESPONSE>} The response of creating a payment.
	 */
	async createPayment(
		options: I_CREATE_PAYMENT_REQUEST,
	): Promise<I_CREATE_PAYMENT_RESPONSE> {
		return await this.request<I_CREATE_PAYMENT_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/payment",
			options,
		);
	}

	/**
	 * Creates a static wallet.
	 *
	 * @param {I_CREATE_STATIC_WALLET_REQUEST} options - The options for creating the static wallet.
	 * @return {Promise<I_CREATE_STATIC_WALLET_RESPONSE>} A promise that resolves with the response of creating the static wallet.
	 */
	async createStaticWallet(
		options: I_CREATE_STATIC_WALLET_REQUEST,
	): Promise<I_CREATE_STATIC_WALLET_RESPONSE> {
		return await this.request<I_CREATE_STATIC_WALLET_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/wallet",
			options,
		);
	}

	/**
	 * Generates a QR code based on the provided options.
	 *
	 * @param {I_GEN_QR_REQUEST} options - The options for generating the QR code.
	 * @return {Promise<I_GEN_QR_RESPONSE>} - A promise that resolves to the generated QR code response.
	 */
	async genQr(options: I_GEN_QR_REQUEST): Promise<I_GEN_QR_RESPONSE> {
		return await this.request<I_GEN_QR_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/wallet/qr",
			options,
		);
	}

	/**
	 * Blocks a static wallet.
	 *
	 * @param {I_BLOCK_STATIC_WALLET_REQUEST} options - The options for blocking the wallet.
	 * @return {Promise<I_BLOCK_STATIC_WALLET_RESPONSE>} - A promise that resolves to the response of the blocking operation.
	 */
	async blockStaticWallet(
		options: I_BLOCK_STATIC_WALLET_REQUEST,
	): Promise<I_BLOCK_STATIC_WALLET_RESPONSE> {
		return await this.request<I_BLOCK_STATIC_WALLET_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/wallet/block-address",
			options,
		);
	}

	/**
	 * Refunds from a blocked wallet.
	 *
	 * @param {I_REFUND_FROM_BLOCK_WALLET_REQUEST} options - The options for the refund request.
	 * @return {Promise<I_REFUND_FROM_BLOCK_WALLET_RESPONSE>} - A promise that resolves to the refund response.
	 */
	async refundFromBlockedWallet(
		options: I_REFUND_FROM_BLOCK_WALLET_REQUEST,
	): Promise<I_REFUND_FROM_BLOCK_WALLET_RESPONSE> {
		return await this.request<I_REFUND_FROM_BLOCK_WALLET_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/wallet/blocked-address-refund",
			options,
		);
	}

	/**
	 * Retrieves the payment information based on the provided options.
	 *
	 * @param {I_PAYMENT_INFO_REQUEST} options - The payment information request options.
	 * @return {Promise<I_PAYMENT_INFO_RESPONSE>} The payment information response.
	 */
	async getPayment(
		options: I_PAYMENT_INFO_REQUEST,
	): Promise<I_PAYMENT_INFO_RESPONSE> {
		return await this.request<I_PAYMENT_INFO_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/payment/info",
			options,
		);
	}

	/**
	 * Refunds a payment.
	 *
	 * @param {I_PAYMENT_REFUND_REQUEST} options - The options for refunding the payment.
	 * @return {Promise<I_PAYMENT_REFUND_RESPONSE>} The response containing the refund details.
	 */
	async refundPayment(
		options: I_PAYMENT_REFUND_REQUEST,
	): Promise<I_PAYMENT_REFUND_RESPONSE> {
		return await this.request<I_PAYMENT_REFUND_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/payment/refund",
			options,
		);
	}

	/**
	 * Asynchronously resends a webhook.
	 *
	 * @param {I_RESEND_WEBHOOK_REQUEST} options - The options for resending the webhook.
	 * @return {Promise<I_RESEND_WEBHOOK_RESPONSE>} - The response from the resend request.
	 */
	async resendWebhook(
		options: I_RESEND_WEBHOOK_REQUEST,
	): Promise<I_RESEND_WEBHOOK_RESPONSE> {
		return await this.request<I_RESEND_WEBHOOK_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/payment/resend",
			options,
		);
	}

	/**
	 * Sends a test webhook request and returns the response.
	 *
	 * @param {I_TEST_WEBHOOK_REQUEST} options - The options for the test webhook request.
	 * @return {Promise<I_TEST_WEBHOOK_RESPONSE>} - A promise that resolves to the response of the test webhook request.
	 */
	async testPaymentWebhook(
		options: I_TEST_WEBHOOK_REQUEST,
	): Promise<I_TEST_WEBHOOK_RESPONSE> {
		return await this.request<I_TEST_WEBHOOK_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/test-webhook/payment",
			options,
		);
	}

	/**
	 * Creates a recurring payment.
	 *
	 * @param {I_CREATE_RECURRING_REQUEST} options - The recurring payment options.
	 * @return {Promise<I_CREATE_RECURRING_RESPONSE>} The response of creating a recurring payment.
	 */
	async createRecurring(
		options: I_CREATE_RECURRING_REQUEST,
	): Promise<I_CREATE_RECURRING_RESPONSE> {
		return await this.request<I_CREATE_RECURRING_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/recurrence/create",
			options,
		);
	}

	/**
	 * Gets information about a recurring payment.
	 *
	 * @param {I_RECURRING_INFO_REQUEST} options - The recurring payment info request options.
	 * @return {Promise<I_RECURRING_INFO_RESPONSE>} The recurring payment information.
	 */
	async getRecurringInfo(
		options: I_RECURRING_INFO_REQUEST,
	): Promise<I_RECURRING_INFO_RESPONSE> {
		return await this.request<I_RECURRING_INFO_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/recurrence/info",
			options,
		);
	}

	/**
	 * Gets a list of recurring payments.
	 *
	 * @param {I_RECURRING_LIST_REQUEST} options - The recurring payment list request options.
	 * @return {Promise<I_RECURRING_LIST_RESPONSE>} The list of recurring payments.
	 */
	async getRecurringList(
		options: I_RECURRING_LIST_REQUEST = {},
	): Promise<I_RECURRING_LIST_RESPONSE> {
		return await this.request<I_RECURRING_LIST_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/recurrence/list",
			options,
		);
	}

	/**
	 * Cancels a recurring payment.
	 *
	 * @param {I_RECURRING_CANCEL_REQUEST} options - The recurring payment cancel request options.
	 * @return {Promise<I_RECURRING_CANCEL_RESPONSE>} The response of canceling the recurring payment.
	 */
	async cancelRecurring(
		options: I_RECURRING_CANCEL_REQUEST,
	): Promise<I_RECURRING_CANCEL_RESPONSE> {
		return await this.request<I_RECURRING_CANCEL_RESPONSE>(
			E_HTTP.POST,
			E_TOKEN.PAYMENT,
			"v1/recurrence/cancel",
			options,
		);
	}

	/**
	 * Generates a signature for the given data and key.
	 *
	 * @param {Record<string, any>} data - The data to generate the signature for.
	 * @param {string} key - The key used in the signature generation.
	 * @return {string} The generated signature.
	 */
	makeSignature(data: Record<string, any>, key: string): string {
		const signature = createHash("md5")
			.update(Buffer.from(JSON.stringify(data)).toString("base64") + key)
			.digest("hex");

		return signature;
	}

	/**
	 * Verifies the signature of the given data.
	 *
	 * @param {Record<string, any>} data - The data to verify the signature for.
	 * @return {boolean} Returns true if the signature is valid, false otherwise.
	 */
	verifySignature(data: Record<string, any>): boolean {
		const remote = data.sign;
		data.sign = undefined;

		return remote === this.makeSignature(data, this.paymentToken);
	}
}
