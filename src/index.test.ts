import { Cryptomus } from ".";
import { v4 as uuid } from "uuid";

describe("Cryptomus", () => {
	let cryptomus: Cryptomus;

	beforeAll(() => {
		cryptomus = new Cryptomus(
			process.env.MERCHANT as string,
			process.env.PAYMENT_TOKEN as string,
		);
	});

	test("Module", () => {
		expect(cryptomus).toBeDefined();
	});

	test("Create payment", async () => {
		const response = await cryptomus.createPayment({
			order_id: uuid(),
			amount: "10",
			currency: "USDT",
			url_callback: "https://example.com/callback",
			url_return: "https://example.com/return",
		});

		expect(response.result.amount).toBe("10.00");
	});

	test("Create recurring payment", async () => {
		const response = await cryptomus.createRecurring({
			amount: "10",
			currency: "USDT",
			name: "Test recurring payment",
			period: "daily",
			url_callback: "https://example.com/callback",
			url_return: "https://example.com/return",
		});

		expect(response.result.amount).toBe("10.00");
	});
});
