"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cryptomus = void 0;
const node_crypto_1 = require("node:crypto");
const types_1 = require("./types");
const errors_1 = require("./errors");
class Cryptomus {
    merchant;
    paymentToken;
    constructor(merchant, paymentToken) {
        this.merchant = merchant;
        this.paymentToken = paymentToken;
    }
    /**
     * Sends a request to the specified route using the given HTTP method and token type.
     *
     * @param {E_HTTP} method - The HTTP method to use for the request.
     * @param {E_TOKEN} type - The type of token to use for authentication.
     * @param {string} route - The route to send the request to.
     * @param {Record<string, any>} data - The data to include in the request.
     * @return {Promise<T>} - A promise that resolves with the response data.
     */
    async request(method, type, route, data) {
        const url = new URL(`https://api.cryptomus.com/${route}`);
        const headers = {
            "Content-Type": "application/json",
            Merchant: this.merchant,
            Sign: this.makeSignatue(data, this.paymentToken),
        };
        const options = {
            method,
            headers,
        };
        if (method === types_1.E_HTTP.GET) {
            for (const key of Object.keys(data)) {
                url.searchParams.append(key, data[key]);
            }
        }
        else if (method === types_1.E_HTTP.POST) {
            options.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url.toString(), options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            return responseData;
        }
        catch (error) {
            throw new errors_1.CryptomusError(error instanceof Error ? error.message : String(error));
        }
    }
    /**
     * Creates a payment.
     *
     * @param {I_CREATE_PAYMENT_REQUEST} options - The payment options.
     * @return {Promise<I_CREATE_PAYMENT_RESPONSE>} The response of creating a payment.
     */
    async createPayment(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/payment", options);
    }
    /**
     * Creates a static wallet.
     *
     * @param {I_CREATE_STATIC_WALLET_REQUEST} options - The options for creating the static wallet.
     * @return {Promise<I_CREATE_STATIC_WALLET_RESPONSE>} A promise that resolves with the response of creating the static wallet.
     */
    async createStaticWallet(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/wallet", options);
    }
    /**
     * Generates a QR code based on the provided options.
     *
     * @param {I_GEN_QR_REQUEST} options - The options for generating the QR code.
     * @return {Promise<I_GEN_QR_RESPONSE>} - A promise that resolves to the generated QR code response.
     */
    async genQr(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/wallet/qr", options);
    }
    /**
     * Blocks a static wallet.
     *
     * @param {I_BLOCK_STATIC_WALLET_REQUEST} options - The options for blocking the wallet.
     * @return {Promise<I_BLOCK_STATIC_WALLET_RESPONSE>} - A promise that resolves to the response of the blocking operation.
     */
    async blockStaticWallet(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/wallet/block-address", options);
    }
    /**
     * Refunds from a blocked wallet.
     *
     * @param {I_REFUND_FROM_BLOCK_WALLET_REQUEST} options - The options for the refund request.
     * @return {Promise<I_REFUND_FROM_BLOCK_WALLET_RESPONSE>} - A promise that resolves to the refund response.
     */
    async refundFromBlockedWallet(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/wallet/blocked-address-refund", options);
    }
    /**
     * Retrieves the payment information based on the provided options.
     *
     * @param {I_PAYMENT_INFO_REQUEST} options - The payment information request options.
     * @return {Promise<I_PAYMENT_INFO_RESPONSE>} The payment information response.
     */
    async getPayment(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/payment/info", options);
    }
    /**
     * Refunds a payment.
     *
     * @param {I_PAYMENT_REFUND_REQUEST} options - The options for refunding the payment.
     * @return {Promise<I_PAYMENT_REFUND_RESPONSE>} The response containing the refund details.
     */
    async refundPayment(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/payment/refund", options);
    }
    /**
     * Asynchronously resends a webhook.
     *
     * @param {I_RESEND_WEBHOOK_REQUEST} options - The options for resending the webhook.
     * @return {Promise<I_RESEND_WEBHOOK_RESPONSE>} - The response from the resend request.
     */
    async resendWebhook(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/payment/resend", options);
    }
    /**
     * Sends a test webhook request and returns the response.
     *
     * @param {I_TEST_WEBHOOK_REQUEST} options - The options for the test webhook request.
     * @return {Promise<I_TEST_WEBHOOK_RESPONSE>} - A promise that resolves to the response of the test webhook request.
     */
    async testPaymentWebhook(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/test-webhook/payment", options);
    }
    /**
     * Creates a recurring payment.
     *
     * @param {I_CREATE_RECURRING_REQUEST} options - The recurring payment options.
     * @return {Promise<I_CREATE_RECURRING_RESPONSE>} The response of creating a recurring payment.
     */
    async createRecurring(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/recurrence/create", options);
    }
    /**
     * Gets information about a recurring payment.
     *
     * @param {I_RECURRING_INFO_REQUEST} options - The recurring payment info request options.
     * @return {Promise<I_RECURRING_INFO_RESPONSE>} The recurring payment information.
     */
    async getRecurringInfo(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/recurrence/info", options);
    }
    /**
     * Gets a list of recurring payments.
     *
     * @param {I_RECURRING_LIST_REQUEST} options - The recurring payment list request options.
     * @return {Promise<I_RECURRING_LIST_RESPONSE>} The list of recurring payments.
     */
    async getRecurringList(options = {}) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/recurrence/list", options);
    }
    /**
     * Cancels a recurring payment.
     *
     * @param {I_RECURRING_CANCEL_REQUEST} options - The recurring payment cancel request options.
     * @return {Promise<I_RECURRING_CANCEL_RESPONSE>} The response of canceling the recurring payment.
     */
    async cancelRecurring(options) {
        return await this.request(types_1.E_HTTP.POST, types_1.E_TOKEN.PAYMENT, "v1/recurrence/cancel", options);
    }
    /**
     * Generates a signature for the given data and key.
     *
     * @param {Record<string, any>} data - The data to generate the signature for.
     * @param {string} key - The key used in the signature generation.
     * @return {string} The generated signature.
     */
    makeSignatue(data, key) {
        const signatue = (0, node_crypto_1.createHash)("md5")
            .update(Buffer.from(JSON.stringify(data)).toString("base64") + key)
            .digest("hex");
        return signatue;
    }
    /**
     * Verifies the signature of the given data.
     *
     * @param {Record<string, any>} data - The data to verify the signature for.
     * @return {boolean} Returns true if the signature is valid, false otherwise.
     */
    verifySignatue(data) {
        const remote = data.sign;
        data.sign = undefined;
        return remote === this.makeSignatue(data, this.paymentToken);
    }
}
exports.Cryptomus = Cryptomus;
